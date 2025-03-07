import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { UpdateJobDtoV3 } from "../dto/update-job.v3.dto";
import { UpdateJobDto } from "../dto/update-job.dto";

@Injectable()
export class UpdateJobV3MappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const dtoV3 = request.body as UpdateJobDtoV3;
    let newBody: UpdateJobDto = {
      statusCode: dtoV3.jobStatusMessage ?? "",
      statusMessage: dtoV3.jobStatusMessage ?? "",
    };
    if (dtoV3.jobResultObject) {
      newBody = {
        ...newBody,
        jobResultObject: dtoV3.jobResultObject,
      };
    }
    request.body = newBody;
    return next.handle();
  }
}
