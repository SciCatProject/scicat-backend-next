import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class CreateJobV3MappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const newBody = {
      type: request.body.type,
      jobParams: {
        datasetList: request.body.datasetList ?? [],
      },
      ownerUser: request.body.jobParams.username,
      contactEmail: request.body.emailJobInitiator,
    };
    request.body = newBody;
    return next.handle();
  }
}
