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
  providers: [AuthService, JwtStrategy, LdapStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
