import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { genSalt, hash } from "bcrypt";
import { FilterQuery, Model, ObjectId } from "mongoose";
import { CreateUserIdentityDto } from "./dto/create-user-identity.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { RolesService } from "./roles.service";
import {
  UserIdentity,
  UserIdentityDocument,
} from "./schemas/user-identity.schema";
import { User, UserDocument } from "./schemas/user.schema";
import { CreateRoleDto } from "./dto/create-role.dto";
import { CreateUserRoleDto } from "./dto/create-user-role.dto";
import { CreateUserJWT } from "./dto/create-user-jwt.dto";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { JWTUser } from "../auth/interfaces/jwt-user.interface";
import * as fs from "fs";
import {
  UserSettings,
  UserSettingsDocument,
} from "./schemas/user-settings.schema";
import { CreateUserSettingsDto } from "./dto/create-user-settings.dto";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";
import { UpdateUserIdentityDto } from "./dto/update-user-identity.dto";
import { UserPayload } from "src/auth/interfaces/userPayload.interface";
import { AccessGroupService } from "src/auth/access-group-provider/access-group.service";

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private rolesService: RolesService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserIdentity.name)
    private userIdentityModel: Model<UserIdentityDocument>,
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettingsDocument>,
    private accessGroupService: AccessGroupService,
  ) {}

  async onModuleInit() {
    let functionalAccounts =
      this.configService.get<CreateUserDto[]>("functionalAccounts");

    const filePath = "functionalAccounts.json";
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      functionalAccounts = JSON.parse(data);
    }

    if (functionalAccounts && functionalAccounts.length > 0) {
      const accountPromises = functionalAccounts.map(async (account) => {
        const { role, global, ...createAccount } = account;
        createAccount.authStrategy = "local";
        const user = await this.findOrCreate(createAccount);
        const roles: Record<string, Array<string>> = {};

        if (user) {
          const userPayload: UserPayload = {
            userId: user.id as string,
            username: user.username,
            email: user.email,
          };
          const accessGroupsOrig =
            await this.accessGroupService.getAccessGroups(userPayload);
          const accessGroups = [...accessGroupsOrig];

          if (role) {
            // add role as access group
            accessGroups.push(role);
            if (!(role in roles)) {
              roles[role] = [];
            }
            roles[role].push(user._id.toString());
          }
          if (global) {
            accessGroups.push("globalaccess");
            if (!("globalaccess" in roles)) {
              roles["globalaccess"] = [];
            }
            roles["globalaccess"].push(user._id.toString());
          }

          // creates user identity to store access groups
          const createUserIdentity: CreateUserIdentityDto = {
            authStrategy: "local",
            credentials: {},
            externalId: "",
            profile: {
              displayName: account.username as string,
              email: account.email as string,
              username: account.username as string,
              thumbnailPhoto: "error: no photo found",
              emails: [{ value: account.email as string }],
              accessGroups: [...new Set([role as string, ...accessGroups])],
              id: user.id as string,
            },
            provider: "local",
            userId: user._id,
          };

          const tempUserIdentity = await this.findByIdUserIdentity(user._id);
          if (tempUserIdentity) {
            await this.updateUserIdentity(createUserIdentity, user._id);
          } else {
            await this.createUserIdentity(createUserIdentity);
          }
        }
        return roles;
      });

      const results = await Promise.all(accountPromises);
      const roles = results.reduce((a, b) => {
        Object.keys(b).forEach((k) => {
          if (k in a) {
            a[k] = a[k].concat(b[k]);
          } else {
            a[k] = b[k];
          }
        });
        return a;
      }, {});
      if (roles) {
        for (const [role, userIds] of Object.entries(roles)) {
          const createRole: CreateRoleDto = {
            name: role,
          };
          const createdRole = await this.rolesService.findOrCreate(createRole);
          if (createdRole && userIds) {
            userIds.forEach(async (userId) => {
              const createUserRole: CreateUserRoleDto = {
                userId: userId,
                roleId: createdRole._id,
              };
              await this.rolesService.findOrCreateUserRole(createUserRole);
            });
          }
        }
      }
    }
  }

  async userExists(filter: FilterQuery<UserDocument>): Promise<boolean> {
    const user = await this.userModel.exists(filter);
    return user ? true : false;
  }

  async create(createUserDto: CreateUserDto): Promise<User | null> {
    Logger.log(
      `Creating user ${createUserDto.username} ( Strategy : ${createUserDto.authStrategy} )`,
      "UsersService",
    );

    if (createUserDto.authStrategy !== "local") {
      const { password, ...sanitizedCreateUserDto } = createUserDto;
      const createdUser = new this.userModel(sanitizedCreateUserDto);
      return createdUser.save();
    } else if (createUserDto.password) {
      const hashedPassword = await hash(
        createUserDto.password,
        await genSalt(),
      );
      const createUser = { ...createUserDto, password: hashedPassword };
      const createdUser = new this.userModel(createUser);
      return createdUser.save();
    }
    return null;
  }

  async findOrCreate(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, "password"> | null> {
    const userFilter: FilterQuery<UserDocument> = {
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    };
    const userExists = await this.userExists(userFilter);

    if (userExists) {
      return await this.findOne(userFilter);
    }

    return await this.create(createUserDto);
  }

  async findOne(
    filter: FilterQuery<UserDocument>,
    includePassword = false,
  ): Promise<Omit<User, "password"> | null> {
    return includePassword
      ? this.userModel.findOne(filter).select("+password").exec()
      : this.userModel.findOne(filter).exec();
  }

  async findById(id: string): Promise<Omit<User, "password"> | null> {
    return this.userModel.findById(id).exec();
  }

  async findById2JWTUser(id: string): Promise<JWTUser | null> {
    const userIdentity = await this.userIdentityModel
      .findOne({ userId: id })
      .exec();
    if (userIdentity) {
      const userProfile = userIdentity.profile;
      return {
        _id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        currentGroups: userProfile.accessGroups,
      } as JWTUser;
    }
    return null;
  }

  async createUserIdentity(
    createUserIdentityDto: CreateUserIdentityDto,
  ): Promise<UserIdentity> {
    const createdUserIdentity = new this.userIdentityModel(
      createUserIdentityDto,
    );
    return createdUserIdentity.save();
  }

  async updateUserIdentity(
    updateUserIdentityDto: UpdateUserIdentityDto,
    userId: string,
  ): Promise<UserIdentity | null> {
    return this.userIdentityModel
      .findOneAndUpdate({ userId }, updateUserIdentityDto, { new: true })
      .exec();
  }

  // NOTE: This is just for testing purposes inside accessGroups.e2e-spec.ts
  async removeUserIdentity(userId: string): Promise<UserIdentity | null> {
    const removedUserIdentity = await this.userIdentityModel
      .findOneAndDelete({ userId })
      .exec();

    return removedUserIdentity;
  }

  async findByIdUserIdentity(userId: string): Promise<UserIdentity | null> {
    return this.userIdentityModel.findOne({ userId }).exec();
  }

  async createUserSettings(
    userId: string,
    createUserSettingsDto: CreateUserSettingsDto,
  ): Promise<UserSettings> {
    const createdUserSettings = new this.userSettingsModel({
      ...createUserSettingsDto,
      userId,
    });
    return createdUserSettings.save();
  }

  async findByIdUserSettings(userId: string): Promise<UserSettings | null> {
    return this.userSettingsModel.findOne({ userId }).exec();
  }

  async findOneAndUpdateUserSettings(
    userId: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings | null> {
    return this.userSettingsModel
      .findOneAndUpdate({ userId }, updateUserSettingsDto, { new: true })
      .exec();
  }

  async findOneAndDeleteUserSettings(userId: string): Promise<unknown> {
    return this.userSettingsModel.findOneAndDelete({ userId }).exec();
  }

  async createUserJWT(
    accessToken: JWTUser | undefined,
  ): Promise<CreateUserJWT | null> {
    const signAndVerifyOptions = {
      expiresIn: this.configService.get<string>("jwt.expiresIn") || "1h",
      secret: this.configService.get<string>("jwt.secret"),
    };

    if (!accessToken) {
      const groups = ["public"];
      const payload = {
        username: "anonymous",
        groups,
      };
      const jwtString = this.jwtService.sign(payload, signAndVerifyOptions);
      return { jwt: jwtString };
    }

    const payload = {
      username: accessToken._id,
      groups: accessToken.currentGroups,
    };
    const jwtString = this.jwtService.sign(payload, signAndVerifyOptions);
    return { jwt: jwtString };
  }

  async createCustomJWT(
    user: Omit<User, "password">,
    jwtProperties: JwtSignOptions,
  ): Promise<CreateUserJWT | null> {
    const signAndVerifyOptions: JwtSignOptions = {
      ...jwtProperties,
    } as JwtSignOptions;
    if (signAndVerifyOptions.expiresIn == "never") {
      signAndVerifyOptions.expiresIn =
        this.configService.get<string>("jwt.neverExpires") || "100y";
    } else if (
      typeof signAndVerifyOptions.expiresIn === "string" &&
      signAndVerifyOptions.expiresIn &&
      !isNaN(+signAndVerifyOptions.expiresIn)
    ) {
      signAndVerifyOptions.expiresIn = parseInt(signAndVerifyOptions.expiresIn);
    } else if (!signAndVerifyOptions.expiresIn) {
      signAndVerifyOptions.expiresIn =
        this.configService.get<string>("jwt.expiresIn") || "1h";
    }
    signAndVerifyOptions.secret = this.configService.get<string>("jwt.secret");
    const jwtString = this.jwtService.sign(user, signAndVerifyOptions);
    return { jwt: jwtString };
  }
}
