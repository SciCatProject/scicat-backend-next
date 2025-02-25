import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import type { OidcConfig } from "src/config/configuration";

declare module "express-session" {
  interface SessionData {
    client?: string;
    returnURL?: string;
    successURL?: string;
  }
}

@Injectable()
export class OidcAuthGuard extends AuthGuard("oidc") {
  oidcConfig?: OidcConfig;
  constructor(private configService: ConfigService) {
    super();
    this.oidcConfig = this.configService.get<OidcConfig>("oidc");
  }

  getRequest(context: ExecutionContext): Request {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.path.endsWith("/auth/oidc/callback")) {
      return request;
    }

    const client = this.getClient(request);
    const returnURL = this.getReturnURL(request, client);
    const successURL = this.getSuccessURL(request, client);

    request.session.client = client;
    request.session.returnURL = returnURL;
    request.session.successURL = successURL;

    return request;
  }

  private getClient(request: Readonly<Request>): string {
    const client = request.query.client;
    if (client && typeof client === "string") {
      if (!this.oidcConfig?.frontendClients.includes(client)) {
        throw new HttpException("Unauthorized client", HttpStatus.UNAUTHORIZED);
      }
      return client;
    }
    return "scicat";
  }

  private getReturnURL(request: Readonly<Request>, client: string): string {
    const returnURL = request.query.returnURL;
    if (returnURL && typeof returnURL === "string") {
      return returnURL;
    } else {
      return this.oidcConfig?.clientConfig[client].returnURL || "/datasets";
    }
  }

  private getSuccessURL(request: Readonly<Request>, client: string): string {
    if (
      !this.oidcConfig?.clientConfig[client].successURL &&
      request.headers.referer
    ) {
      // For MAX IV, recommend deprecating and using config based successURL
      return request.headers.referer;
    }
    return this.oidcConfig?.clientConfig[client].successURL || "";
  }
}
