import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
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
import { IUserInfoMapping } from "src/common/interfaces/common.interface";

type UserInfoResponseWithGroups = UserinfoResponse & {
  groups: string[];
};

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
    const userinfo: UserInfoResponseWithGroups =
      await this.client.userinfo(tokenset);
    const oidcConfig = this.configService.get<OidcConfig>("oidc");

    const userProfile = this.parseUserInfo(userinfo);
    const userPayload: UserPayload = {
      userId: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      accessGroupProperty: oidcConfig?.accessGroupProperty,
      payload: userinfo,
    };
    userProfile.accessGroups =
      await this.accessGroupService.getAccessGroups(userPayload);

    const userFilter: FilterQuery<UserDocument> = {
      $or: [
        { username: userProfile.username },
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
      Logger.log("Created oidc user ", newUser.username);

      const createUserIdentity: CreateUserIdentityDto = {
        authStrategy: "oidc",
        credentials: {},
        externalId: userProfile.id,
        profile: userProfile,
        provider: "oidc",
        userId: newUser._id,
      };

      await this.usersService.createUserIdentity(createUserIdentity);
      Logger.log("Created user identity for oidc user with id ", newUser._id);

      user = newUser;
    } else {
      await this.usersService.updateUserIdentity(
        {
          profile: userProfile,
          externalId: userProfile.id,
        },
        user._id,
      );
    }

    const jsonUser = JSON.parse(JSON.stringify(user));
    const { password, ...returnUser } = jsonUser;
    returnUser.userId = returnUser._id;

    return returnUser;
  }

  getUserPhoto(thumbnailPhoto: string) {
    return thumbnailPhoto
      ? "data:image/jpeg;base64," +
          Buffer.from(thumbnailPhoto, "binary").toString("base64")
      : "no photo";
  }

  parseUserInfo(userinfo: UserInfoResponseWithGroups) {
    type OidcProfile = Profile & UserProfile;
    const profile = {} as OidcProfile;

    const newUserInfoFields =
      this.configService.get<IUserInfoMapping>("oidc.userInfoMapping") || {};

    // To dynamically map user info fields based on environment variables,
    // set mappings like OIDC_USERINFO_MAPPING_FIELD_USERNAME=family_name.
    // This assigns userinfo.family_name to oidcUser.username.

    const oidcUser: IUserInfoMapping = {
      id: userinfo["sub"] || (userinfo["user_id"] as string) || "",
      username: userinfo["sub"] || "",
      displayName: userinfo["name"] || "",
      familyName: userinfo["family_name"] || "",
      email: userinfo["email"] || "",
      thumbnailPhoto: (userinfo["thumbnailPhoto"] as string) || "",
      groups: userinfo["groups"] || [],
    };

    Object.entries(newUserInfoFields).forEach(([sourceField, targetField]) => {
      if (
        typeof targetField === "string" &&
        oidcUser.hasOwnProperty(sourceField)
      ) {
        oidcUser[sourceField] = userinfo[targetField] as string;
      }
    });

    // Prior to OpenID Connect Basic Client Profile 1.0 - draft 22, the "sub"
    // claim was named "user_id".  Many providers still use the old name, so
    // fallback to that. https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims

    if (!oidcUser.id) {
      throw new Error("Could not find sub or user_id in userinfo response");
    }

    profile.displayName = oidcUser.displayName + oidcUser.familyName;
    profile.emails = oidcUser.email ? [{ value: oidcUser.email }] : [];
    profile.thumbnailPhoto = this.getUserPhoto(oidcUser.thumbnailPhoto);

    const oidcUserProfile = { ...oidcUser, ...profile };

    return oidcUserProfile;
  }
}
