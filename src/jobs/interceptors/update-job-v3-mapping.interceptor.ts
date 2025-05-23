import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { UpdateJobDtoV3 } from "../dto/update-job.v3.dto";
import { UpdateJobDto } from "../dto/update-job.dto";
import { mapUpdateJobDtoV3ToV4 } from "../job-v3-mappings";

/**
 * PATCH/api/v3/jobs requires an UpdateJobDtoV3 object as request body.
 * This interceptor maps the UpdateJobDtoV3 object to a UpdateJobDto object,
 * to ensure compatibility with PATCH/api/v4/jobs.
 */
@Injectable()
export class UpdateJobV3MappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const dtoV3 = request.body as UpdateJobDtoV3;

    const newBody: UpdateJobDto = mapUpdateJobDtoV3ToV4(dtoV3);
    request.body = newBody;
    return next.handle();
  }
}
