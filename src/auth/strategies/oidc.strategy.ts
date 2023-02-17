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
import { AccessGroupService } from "../access-group-provider/access-group.service";
import { UserPayload } from "../interfaces/userPayload.interface";

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
  authStrategy = "oidc";

  constructor(
    private readonly authService: AuthService,
    client: Client,
    private configService: ConfigService,
    private usersService: UsersService,
    private accessGroupService: AccessGroupService,
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
    const userPayload: UserPayload = {
      userId: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
    };
    userProfile.accessGroups = await this.accessGroupService.getAccessGroups(
      userPayload,
    );

    const userFilter: FilterQuery<UserDocument> = {
      $or: [
        { username: `oidc.${userProfile.username}` },
        { email: userProfile.email as string },
      ],
    };
    let user = await this.usersService.findOne(userFilter);
    if (!user) {
      const createUser: CreateUserDto = {
        username: userProfile.username,
        email: userProfile.email as string,
        authStrategy: "oidc",
      };

      const newUser = await this.usersService.create(createUser);
      if (!newUser) {
        throw new InternalServerErrorException(
          "Could not create User from OIDC response.",
        );
      }

      const createUserIdentity: CreateUserIdentityDto = {
        authStrategy: "oidc",
        credentials: {},
        externalId: userProfile.id,
        profile: userProfile,
        provider: "oidc",
        userId: newUser._id,
      };

      await this.usersService.createUserIdentity(createUserIdentity);

      user = newUser;
    } else {
      await this.usersService.updateUserIdentity(
        {
          profile: userProfile,
        },
        user._id,
      );
    }

    const jsonUser = JSON.parse(JSON.stringify(user));
    const { password, ...returnUser } = jsonUser;
    returnUser.userId = returnUser._id;

    return returnUser;
  }

  getUserPhoto(userinfo: UserinfoResponse) {
    return userinfo.thumbnailPhoto
      ? "data:image/jpeg;base64," +
          Buffer.from(userinfo.thumbnailPhoto as string, "binary").toString(
            "base64",
          )
      : "no photo";
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

    return profile;
  }
}
