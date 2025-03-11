import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
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

    if (!dtoV3.jobStatusMessage) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "jobStatusMessage is required",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let newBody: UpdateJobDto = {
      statusCode: dtoV3.jobStatusMessage,
      statusMessage: dtoV3.jobStatusMessage,
    };

    let newjobResultObject = dtoV3.jobResultObject;
    if (dtoV3.executionTime) {
      newjobResultObject = {
        ...newjobResultObject,
        executionTime: dtoV3.executionTime,
      };
    }
    newBody = {
      ...newBody,
      jobResultObject: newjobResultObject,
    };
    request.body = newBody;
    return next.handle();
  }
}
