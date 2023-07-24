import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OidcAuthGuard extends AuthGuard("oidc") {
  constructor(private referer: Record<string, string>) {
    referer = {};
    super();
  }

  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let cookie: string = request.headers["cookie"]
      .split(";")
      .find((c: string) => c.startsWith("connect.sid="));
    if (request.headers["referer"]) {
      this.referer[cookie] = request.headers["referer"];
    } else {
      request.headers["referer"] = this.referer[cookie];
      delete this.referer[cookie];
    }
    return request;
  }
}
