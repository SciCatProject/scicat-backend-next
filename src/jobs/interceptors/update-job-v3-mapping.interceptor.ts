import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class UpdateJobV3MappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const newBody = {
      statusCode: request.body.jobStatusMessage ?? "",
      statusMessage: request.body.jobStatusMessage ?? "",
      jobResultObject: request.body.jobResultObject ?? {},
    };
    request.body = newBody;
    return next.handle();
  }
}
