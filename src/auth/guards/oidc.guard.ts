import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { OidcConfig } from "src/config/configuration";

declare module "express-session" {
  interface SessionData {
    client?: string;
    returnURL?: string;
    successURL?: string;
  }
}

@Injectable()
export class OidcAuthGuard extends AuthGuard("oidc") {
  constructor(private configService: ConfigService) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    let client = request.query.client;
    const returnURL = request.query.returnURL;
    const oidcConfig = this.configService.get<OidcConfig>("oidc");
    if (client && typeof client === "string") {
      if (!oidcConfig?.frontendClients.includes(client)) {
        throw new HttpException("Unauthorized client", HttpStatus.UNAUTHORIZED);
      }
    } else {
      client = "scicat";
    }
    request.session.client = client;

    if (returnURL && typeof returnURL === "string") {
      request.session.returnURL = returnURL;
    }
    if (request.headers.referer) {
      // For MAX IV, recommend deprecating and using config based successURL
      request.session.successURL = request.headers.referer;
    }
    return request;
  }
}
