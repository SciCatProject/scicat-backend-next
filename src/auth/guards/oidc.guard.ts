import { ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { OidcConfig } from "src/config/configuration";

declare module "express-session" {
  interface SessionData {
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
    const successURL = request.query.successURL;
    const sessionID = request.sessionID;
    console.log("oidc.guard.ts: ", sessionID, successURL)
    if (successURL && typeof successURL === "string") {
      if (!this.isValidSuccessURL(successURL)) {
        throw new HttpException("Invalid successURL", HttpStatus.UNAUTHORIZED);
      }
      request.session.successURL = successURL;
    }
    else if (request.headers.referer) {
      request.session.successURL = request.headers.referer;
    }
    return request;
  }

  isValidSuccessURL(successURL : string) : boolean {
    const oidcConfig = this.configService.get<OidcConfig>("oidc");
    const allowedSuccessURLs = oidcConfig?.additionalSucessURLs;
    try {
      if (!allowedSuccessURLs) return false;
      const successURLOrigin = new URL(successURL).origin;
      console.log(successURL, successURLOrigin, allowedSuccessURLs);
      return allowedSuccessURLs.some((url) => new URL(url).origin === successURLOrigin); 
    }
    catch (err) {
      console.log("Error occured", err)
      return false;
    }
  }
}

