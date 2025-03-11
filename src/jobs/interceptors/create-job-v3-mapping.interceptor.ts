import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { CreateJobDtoV3 } from "../dto/create-job.v3.dto";
import { CreateJobDto } from "../dto/create-job.dto";
import { DatasetListDto } from "../dto/dataset-list.dto";

interface JobParams {
  datasetList?: DatasetListDto[];
  executionTime?: Date;
  [key: string]: unknown;
}

@Injectable()
export class CreateJobV3MappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const dtoV3 = request.body as CreateJobDtoV3;

    const jobParams: JobParams = {
      datasetList: dtoV3.datasetList ?? [],
      ...dtoV3.jobParams,
    };
    if (dtoV3.executionTime) {
      jobParams.executionTime = dtoV3.executionTime;
    }

    let newBody: CreateJobDto = {
      type: dtoV3.type,
      jobParams: jobParams,
    };
    if (dtoV3.emailJobInitiator) {
      newBody = {
        ...newBody,
        contactEmail: dtoV3.emailJobInitiator,
      };
    }
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
