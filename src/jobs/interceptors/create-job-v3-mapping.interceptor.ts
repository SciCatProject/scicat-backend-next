import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { CreateJobDtoV3 } from "../dto/create-job.v3.dto";
import { CreateJobDto } from "../dto/create-job.dto";

@Injectable()
export class CreateJobV3MappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const dtoV3 = request.body as CreateJobDtoV3;
    let newBody: CreateJobDto = {
      contactEmail: dtoV3.emailJobInitiator,
      type: dtoV3.type,
      jobParams: {
        datasetList: dtoV3.datasetList ?? [],
        ...dtoV3.jobParams,
      },
    };
    if (typeof dtoV3.jobParams?.username === "string") {
      newBody = {
        ...newBody,
        ownerUser: dtoV3.jobParams.username,
      };
    }
    request.body = newBody;
    return next.handle();
  }
}
