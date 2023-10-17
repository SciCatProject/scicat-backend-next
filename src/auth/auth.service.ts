import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { User } from "src/users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { Request } from "express";
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

  async logout(req: Request) {
    const logoutURL = this.configService.get<string>("logoutURL") || "";
    const expressSessionSecret = this.configService.get<string>(
      "expressSessionSecret",
    );

    const logoutResult = await this.additionalLogoutTasks(req, logoutURL);

    if (expressSessionSecret) {
      req.logout(async (err) => {
        if (err) {
          // we should provide a message
          console.log("Logout error");
          console.log(err);
        }
      });

      return logoutResult;
    } else {
      return logoutResult;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flattenObject = (obj: any) => {
    const result: Record<string, unknown> = {};

    for (const i in obj) {
      if (typeof obj[i] === "object" && !Array.isArray(obj[i])) {
        const temp = this.flattenObject(obj[i]);
        for (const j in temp) {
          result[i + "." + j] = temp[j];
        }
      } else {
        result[i] = obj[i];
      }
    }
    return result;
  };

  async additionalLogoutTasks(req: Request, logoutURL: string) {
    const user = req.user as Omit<User, "password">;
    if (user?.authStrategy === "oidc") {
      const oidcConfig = this.configService.get<OidcConfig>("oidc");
      const autoLogout: boolean = parseBoolean(oidcConfig?.autoLogout || true);

      if (autoLogout) {
        if (logoutURL) {
          return {
            logout: "successful",
            logoutURL: logoutURL,
          };
        }

        // If there is no LOGOUT_URL set try to get one from the issuer
        const trustIssuer = await Issuer.discover(
          `${oidcConfig?.issuer}/.well-known/openid-configuration`,
        );
        // Flatten the object in case the end_session url is nested.
        const flattenTrustIssuer = this.flattenObject(trustIssuer);

        // Note search for "end_session" key into the flatten object
        const endSessionEndpointKey = Object.keys(flattenTrustIssuer).find(
          (key) => key.includes("end_session"),
        );

        if (endSessionEndpointKey) {
          // Get the end_session endpoint value
          const endSessionEndpoint = flattenTrustIssuer[endSessionEndpointKey];

          if (endSessionEndpoint) {
            return {
              logout: "successful",
              logoutURL: endSessionEndpoint,
            };
          }
        }
      }
    }

    return { logout: "successful" };
  }
}
