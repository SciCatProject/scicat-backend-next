import { Controller, Request, UseGuards, Post, Get, Res } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { CredentialsDto } from "./dto/credentials.dto";
import { LdapAuthGuard } from "./guards/ldap.guard";
import { AllowAny } from "./decorators/allow-any.decorator";
import { User } from "src/users/schemas/user.schema";
import { OidcAuthGuard } from "./guards/oidc.guard";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";

@ApiBearerAuth()
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiBody({ type: CredentialsDto })
  @AllowAny()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Request() req: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return await this.authService.login(req.user as Omit<User, "password">);
  }

  @ApiBody({ type: CredentialsDto })
  @AllowAny()
  @UseGuards(LdapAuthGuard)
  @Post("msad")
  async adLogin(
    @Request() req: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return await this.authService.login(req.user as Omit<User, "password">);
  }

  @AllowAny()
  @UseGuards(OidcAuthGuard)
  @Get("/oidc")
  async oidcLogin() {
    // this function is invoked when the oidc is set as an auth method. It's behaviour comes from the oidc strategy
  }

  @AllowAny()
  @UseGuards(OidcAuthGuard)
  @Get("/oidc/callback")
  async loginCallback(@Res() res: Response) {
    const token = await this.authService.login(res.req.user as User);
    const url = new URL(
      this.configService.get<Record<string, unknown>>("oidc")
        ?.successURL as string,
    );
    url.searchParams.append("access-token", token.access_token as string);
    url.searchParams.append("user-id", token.userId as string);
    res.redirect(url.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get("whoami")
  async whoami(
    @Request() req: Record<string, unknown>,
  ): Promise<Omit<User, "password">> {
    return req.user as Omit<User, "password">;
  }
}
