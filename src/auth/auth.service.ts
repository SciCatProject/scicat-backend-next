import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { User } from "src/users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { Request, Response } from "express";
import { OidcConfig } from "src/config/configuration";
import { parseBoolean } from "src/common/utils";
import { Issuer } from "openid-client";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.usersService.findOne({ username }, true);

    if (!user) {
      return null;
    }

    // Hacky deep copy of User object, as shallow copy is not enough
    const { password, ...result } = JSON.parse(JSON.stringify(user));
    const match = await compare(pass, password);

    if (!match) {
      return null;
    }

    return result;
  }

  async login(user: Omit<User, "password">): Promise<Record<string, unknown>> {
    const expiresIn = this.configService.get<number>("jwt.expiresIn");
    const accessToken = this.jwtService.sign(user, { expiresIn });
    return {
      access_token: accessToken,
      id: accessToken,
      expires_in: expiresIn,
      ttl: expiresIn,
      created: new Date().toISOString(),
      userId: user._id,
      user,
    };
  }

  async logout(req: Request, res: Response) {
    const logoutURL = this.configService.get<string>("logoutURL") || "";
    const expressSessionSecret = this.configService.get<string>(
      "expressSessionSecret",
    );

    if (expressSessionSecret) {
      req.logout(async (err) => {
        if (err) {
          // we should provide a message
          console.log("Logout error");
          console.log(err);
          //res.status(HttpStatus.BAD_REQUEST);
        }
        return await this.additionalLogoutTasks(req, res, logoutURL);
      });
    } else {
      return await this.additionalLogoutTasks(req, res, logoutURL);
    }
    if (logoutURL) {
      return res
        .status(HttpStatus.OK)
        .send({ logout: "successful", logoutURL: logoutURL });
    }

    return res.status(HttpStatus.OK).send({ logout: "successful" });
  }

  async additionalLogoutTasks(req: Request, res: Response, logoutURL: string) {
    const user = req.user as Omit<User, "password">;
    if (user?.authStrategy == "oidc") {
      const oidcConfig = this.configService.get<OidcConfig>("oidc");
      const autoLogout: boolean = parseBoolean(oidcConfig?.autoLogout || false);
      if (autoLogout) {
        const trustIssuer = await Issuer.discover(
          `${oidcConfig?.issuer}/.well-known/openid-configuration`,
        );
        const end_session_endpoint = trustIssuer.metadata.end_session_endpoint;
        if (end_session_endpoint) {
          return res.status(HttpStatus.OK).send({
            logout: "successful",
            logoutURL:
              end_session_endpoint +
              (logoutURL ? "?post_logout_redirect_uri=" + logoutURL : ""),
          });
        }
      }
    }
    return;
  }
}
