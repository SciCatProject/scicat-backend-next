import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LdapStrategy } from "./strategies/ldap.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersService } from "src/users/users.service";
import { OidcConfig } from "src/config/configuration";
import { BuildOpenIdClient, OidcStrategy } from "./strategies/oidc.strategy";
import { AccessGroupFromApiCallService } from "./access-group-provider/access-group-from-api-call.service";

const OidcStrategyFactory = {
  provide: "OidcStrategy",
  useFactory: async (
    authService: AuthService,
    configService: ConfigService,
    userService: UsersService,
    accessGroupService: AccessGroupFromApiCallService,
  ) => {
    if (!configService.get<OidcConfig>("oidc")?.issuer) {
      return null;
    }
    const clientBuilder = new BuildOpenIdClient(configService);
    const client = await clientBuilder.build();
    const strategy = new OidcStrategy(
      authService,
      client,
      configService,
      userService,
      accessGroupService,
    );
    return strategy;
  },
  inject: [
    AuthService,
    ConfigService,
    UsersService,
    AccessGroupFromApiCallService,
  ],
};

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret"),
        signOptions: { expiresIn: configService.get<number>("jwt.expiresIn") },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({
      defaultStrategy: "jwt",
      property: "user",
      session: false,
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LdapStrategy,
    LocalStrategy,
    OidcStrategyFactory,
    AccessGroupFromApiCallService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
