import {
  Controller,
  UseGuards,
  Post,
  Get,
  Res,
  Req,
  HttpCode,
} from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CredentialsDto } from "./dto/credentials.dto";
import { LdapAuthGuard } from "./guards/ldap.guard";
import { AllowAny } from "./decorators/allow-any.decorator";
import { User } from "src/users/schemas/user.schema";
import { OidcAuthGuard } from "./guards/oidc.guard";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { OidcConfig } from "src/config/configuration";
import { ReturnedAuthLoginDto } from "./dto/returnedLogin.dto";

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
  ): Promise<ReturnedAuthLoginDto> {
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
  ): Promise<ReturnedAuthLoginDto> {
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
  ): Promise<ReturnedAuthLoginDto> {
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
      this.configService.get<OidcConfig>("oidc")?.successURL ||
        res.req.headers["referer"] ||
        "",
    );
    url.searchParams.append("access-token", token.access_token as string);
    url.searchParams.append("user-id", token.userId as string);
    url.searchParams.append(
      "returnUrl",
      this.configService.get<OidcConfig>("oidc")?.returnURL || "/datasets",
    );
    res.redirect(url.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get("whoami")
  async whoami(
    @Req() req: Record<string, unknown>,
  ): Promise<Omit<User, "password">> {
    return req.user as Omit<User, "password">;
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "It logs the current user out.",
    description: "It logs out the current user.",
  })
  @ApiResponse({
    status: 200,
    description: "User logged out",
  })
  @HttpCode(200)
  @Post("logout")
  async logout(@Req() req: Request) {
    return this.authService.logout(req);
  }
}
