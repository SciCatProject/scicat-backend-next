import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import {
  UserIdentity,
  UserIdentitySchema,
} from "./schemas/user-identity.schema";
import { RolesService } from "./roles.service";
import { Role, RoleSchema } from "./schemas/role.schema";
import { UserRole, UserRoleSchema } from "./schemas/user-role.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  UserSettings,
  UserSettingsSchema,
} from "./schemas/user-settings.schema";
import { UserIdentitiesController } from "./user-identities.controller";
import { UserIdentitiesService } from "./user-identities.service";
import { AuthService } from "src/auth/auth.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret"),
        signOptions: { expiresIn: configService.get<number>("jwt.expiresIn") },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: UserIdentity.name,
        schema: UserIdentitySchema,
      },
      {
        name: Role.name,
        schema: RoleSchema,
      },
      {
        name: UserRole.name,
        schema: UserRoleSchema,
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;

          schema.pre<User>("save", function (next) {
            // if id is empty or different than _id,
            // set id to _id
            if (!this.id) {
              this.id = this._id;
            }
            next();
          });
          return schema;
        },
      },
      {
        name: UserSettings.name,
        useFactory: () => {
          const schema = UserSettingsSchema;

          schema.pre<UserSettings>("save", function (next) {
            // if id is empty or different than _id,
            // set id to _id
            if (!this.id) {
              this.id = this._id;
            }
            next();
          });
          return schema;
        },
      },
    ]),
  ],
  providers: [
    AuthService,
    CaslAbilityFactory,
    UsersService,
    UserIdentitiesService,
    RolesService,
  ],
  exports: [UsersService, RolesService],
  controllers: [UsersController, UserIdentitiesController],
})
export class UsersModule {}
