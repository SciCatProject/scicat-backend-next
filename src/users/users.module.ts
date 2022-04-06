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
        name: User.name,
        schema: UserSchema,
      },
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
      {
        name: UserSettings.name,
        schema: UserSettingsSchema,
      },
    ]),
  ],
  providers: [
    CaslAbilityFactory,
    UsersService,
    UserIdentitiesService,
    RolesService,
  ],
  exports: [UsersService, RolesService],
  controllers: [UsersController, UserIdentitiesController],
})
export class UsersModule {}
