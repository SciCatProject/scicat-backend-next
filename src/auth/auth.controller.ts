import { Controller, UseGuards, Post, Get, Res, Req, HttpStatus } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CredentialsDto } from "./dto/credentials.dto";
import { LdapAuthGuard } from "./guards/ldap.guard";
import { AllowAny } from "./decorators/allow-any.decorator";
import { User } from "src/users/schemas/user.schema";
import { OidcAuthGuard } from "./guards/oidc.guard";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { OidcConfig } from "src/config/configuration";
import { Issuer } from "openid-client";

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
    @Req() req: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return await this.authService.login(req.user as Omit<User, "password">);
  }

  @ApiBody({ type: CredentialsDto })
  @ApiOperation({
    summary: "Legacy endpoint to authenticate users through an ldap service.",
    description:
      "This endpoint uses an external ldap service to validate user credentials. It is suggested to migrate to the endpoint /auth/ldap as this one is going to be remove in future releases.",
  })
  @AllowAny()
  @UseGuards(LdapAuthGuard)
  @Post("msad")
  async msadLogin(
    @Req() req: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return await this.authService.login(req.user as Omit<User, "password">);
  }

  @ApiBody({ type: CredentialsDto })
  @ApiOperation({
    summary: "Endpoint to authenticate users through an ldap service.",
    description:
      "This endpoint uses an external ldap service to validate user credentials.",
  })
  @AllowAny()
  @UseGuards(LdapAuthGuard)
  @Post("ldap")
  async ldapLogin(
    @Req() req: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return await this.authService.login(req.user as Omit<User, "password">);
  }

  @AllowAny()
  @UseGuards(OidcAuthGuard)
  @Get("oidc")
  async oidcLogin() {
    // this function is invoked when the oidc is set as an auth method. It's behaviour comes from the oidc strategy
  }

  @AllowAny()
  @UseGuards(OidcAuthGuard)
  @Get("oidc/callback")
  async loginCallback(@Res() res: Response) {
    const token = await this.authService.login(res.req.user as User);
    const url = new URL(
      this.configService.get<OidcConfig>("oidc")?.successURL || "",
    );
    url.searchParams.append("access-token", token.access_token as string);
    url.searchParams.append("user-id", token.userId as string);
    res.redirect(url.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get("whoami")
  async whoami(
    @Req() req: Record<string, unknown>,
  ): Promise<Omit<User, "password">> {
    return req.user as Omit<User, "password">;
  }

  @Get('logout')
  async logout(
    @Req() req: Request, 
    @Res() res: Response,
  ) {
    const user = req.user as Omit<User, "password">;
    const session = req.session;
    const logoutURL = this.configService.get<string>("logoutURL") || req.baseUrl;

    req.logout((err) => {
      if (err) {
        // we should provide a message
        res.status(HttpStatus.BAD_REQUEST);
      }
      if (user.authStrategy == 'oidc') {
        const oidcConfig = this.configService.get<OidcConfig>("oidc");
        req.session.destroy(async (error: any) => {
          const trustIssuer = await Issuer.discover(
            `${oidcConfig?.issuer}/.well-known/openid-configuration`,
          );
          const end_session_endpoint = trustIssuer.metadata.end_session_endpoint;
          if (end_session_endpoint) {
            res.redirect(end_session_endpoint + 
              '?post_logout_redirect_uri=' + logoutURL);
          } else {
            res.redirect(logoutURL);
          }
        })
      } else {
        req.session.destroy(async (error: any) => {
          res.redirect(logoutURL);
        })
      }
    })
  }
}
