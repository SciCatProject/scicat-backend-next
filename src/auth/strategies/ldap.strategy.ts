import * as Strategy from "passport-ldapauth";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { CreateUserIdentityDto } from "src/users/dto/create-user-identity.dto";
import { FilterQuery } from "mongoose";
import { User, UserDocument } from "src/users/schemas/user.schema";

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, "ldap") {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super(configService.get<Record<string, unknown>>("ldap"));
  }

  async validate(
    payload: Record<string, unknown>,
  ): Promise<Omit<User, "password">> {
    const userFilter: FilterQuery<UserDocument> = {
      $or: [
        { username: `ldap.${payload.displayName}` },
        { email: payload.mail as string },
      ],
    };
    const userExists = await this.usersService.userExists(userFilter);

    if (!userExists) {
      const createUser: CreateUserDto = {
        username: `ldap.${payload.displayName}`,
        email: payload.mail as string,
      };
      const user = await this.usersService.create(createUser);

      if (!user) {
        throw new InternalServerErrorException(
          "Could not create User from LDAP response.",
        );
      }

      const createUserIdentity: CreateUserIdentityDto = {
        authScheme: "ldap",
        created: new Date(),
        credentials: {},
        externalId: payload.sAMAccountName as string,
        modified: new Date(),
        profile: {
          displayName: payload.displayName as string,
          email: payload.mail as string,
          username: payload.displayName as string,
          thumbnailPhoto: payload.thumbnailPhoto
            ? "data:image/jpeg;base64," +
              Buffer.from(payload.thumbnailPhoto as string, "binary").toString(
                "base64",
              )
            : "error: no photo found",
          emails: [{ value: payload.mail as string }],
          accessGroups: [],
          id: payload.sAMAccountName as string,
        },
        provider: "ldap",
        userId: user._id,
      };

      if (this.configService.get<string>("site") === "ESS") {
        createUserIdentity.profile.accessGroups = ["ess", "loki", "odin"];
      }

      await this.usersService.createUserIdentity(createUserIdentity);
    }

    const foundUser = await this.usersService.findOne(userFilter);
    const jsonUser = JSON.parse(JSON.stringify(foundUser));
    const { password, ...user } = jsonUser;
    user.userId = user._id;

    return user;
  }
}
