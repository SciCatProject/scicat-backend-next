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
import { BuildOpenIdClient, OidcStrategy } from "./strategies/oidc.strategy";
import { UsersService } from "src/users/users.service";

const OidcStrategyFactory = {
  provide: "OidcStrategy",
  useFactory: async (
    authService: AuthService,
    configService: ConfigService,
    userService: UsersService,
  ) => {
    if (!configService.get<Record<string, unknown>>("oidc")?.issuer)
      return null;
    const clientBuilder = new BuildOpenIdClient(configService);
    const client = await clientBuilder.build();
    const strategy = new OidcStrategy(
      authService,
      client,
      configService,
      userService,
    );
    return strategy;
  },
  inject: [AuthService, ConfigService, UsersService],
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
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
