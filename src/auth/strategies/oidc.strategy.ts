import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { FilterQuery } from "mongoose";
import { CreateUserIdentityDto } from "src/users/dto/create-user-identity.dto";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User, UserDocument } from "src/users/schemas/user.schema";
import { UsersService } from "src/users/users.service";
import {
  Strategy,
  Client,
  UserinfoResponse,
  TokenSet,
  Issuer,
} from "openid-client";
import { AuthService } from "../auth.service";
import { Profile } from "passport";
import { UserProfile } from "src/users/schemas/user-profile.schema";
import { OidcConfig } from "src/config/configuration";

export class BuildOpenIdClient {
  constructor(private configService: ConfigService) {}
  async build() {
    const oidcConfig = this.configService.get<OidcConfig>("oidc");
    const trustIssuer = await Issuer.discover(
      `${oidcConfig?.issuer}/.well-known/openid-configuration`,
    );
    const client = new trustIssuer.Client({
      client_id: oidcConfig?.clientID as string,
      client_secret: oidcConfig?.clientSecret as string,
    });
    return client;
  }
}

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, "oidc") {
  client: Client;
  authScheme = "oidc";

  constructor(
    private readonly authService: AuthService,
    client: Client,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const oidcConfig = configService.get<OidcConfig>("oidc");
    super({
      client: client,
      params: {
        redirect_uri: oidcConfig?.callbackURL,
        scope: oidcConfig?.scope,
      },
      passReqToCallback: false,
      usePKCE: false,
    });

    this.client = client;
  }

  async validate(tokenset: TokenSet): Promise<Omit<User, "password">> {
    const userinfo: UserinfoResponse = await this.client.userinfo(tokenset);

    const userProfile = this.parseUserInfo(userinfo);

    const userFilter: FilterQuery<UserDocument> = {
      $or: [
        { username: `oidc.${userProfile.username}` },
        { email: userProfile.email as string },
      ],
    };
    const userExists = await this.usersService.userExists(userFilter);
    if (!userExists) {
      const createUser: CreateUserDto = {
        username: `oidc.${userProfile.username}`,
        email: userProfile.email as string,
      };

      const user = await this.usersService.create(createUser);
      if (!user) {
        throw new InternalServerErrorException(
          "Could not create User from OIDC response.",
        );
      }

      const createUserIdentity: CreateUserIdentityDto = {
        authScheme: "oidc",
        created: new Date(),
        credentials: {},
        externalId: userProfile.id,
        modified: new Date(),
        profile: userProfile,
        provider: "oidc",
        userId: user._id,
      };

      await this.usersService.createUserIdentity(createUserIdentity);
    }
    const foundUser = await this.usersService.findOne(userFilter);
    const jsonUser = JSON.parse(JSON.stringify(foundUser));
    const { password, ...user } = jsonUser;
    user.userId = user._id;

    return user;
  }

  getUserPhoto(userinfo: UserinfoResponse) {
    return userinfo.thumbnailPhoto
      ? "data:image/jpeg;base64," +
          Buffer.from(userinfo.thumbnailPhoto as string, "binary").toString(
            "base64",
          )
      : "no photo";
  }

  getAccessGroups(userinfo: UserinfoResponse): string[] {
    const defaultAccessGroups: string[] = [];
    const configs = this.configService.get<OidcConfig>("oidc");
    const userInfoResponseObjectAccessGroupKey = configs?.accessGroups;

    if (!userInfoResponseObjectAccessGroupKey) {
      return defaultAccessGroups;
    }
    if (!Array.isArray(userinfo[userInfoResponseObjectAccessGroupKey])) {
      return defaultAccessGroups;
    }

    return userinfo[userInfoResponseObjectAccessGroupKey] as string[];
  }

  parseUserInfo(userinfo: UserinfoResponse) {
    type OidcProfile = Profile & UserProfile;
    const profile = {} as OidcProfile;

    // Prior to OpenID Connect Basic Client Profile 1.0 - draft 22, the "sub"
    // claim was named "user_id".  Many providers still use the old name, so
    // fallback to that.
    const userId = userinfo.sub || (userinfo.user_id as string);
    if (!userId) {
      throw new Error("Could not find sub or user_id in userinfo response");
    }

    profile.id = userId;
    profile.username = userinfo.preferred_username ?? userinfo.name ?? "";
    profile.displayName = userinfo.name ?? "";
    profile.emails = userinfo.email ? [{ value: userinfo.email }] : [];
    profile.email = userinfo.email ?? "";
    profile.thumbnailPhoto = this.getUserPhoto(userinfo);
    profile.accessGroups = this.getAccessGroups(userinfo);

    return profile;
  }
}
