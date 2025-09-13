import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { UpdateJobDtoV3 } from "../dto/update-job.v3.dto";
import { UpdateJobDto } from "../dto/update-job.dto";
import { JobsService } from "../jobs.service";

/**
 * PATCH/api/v3/jobs requires an UpdateJobDtoV3 object as request body.
 * This interceptor maps the UpdateJobDtoV3 object to a UpdateJobDto object,
 * to ensure compatibility with PATCH/api/v4/jobs.
 */
@Injectable()
export class UpdateJobV3MappingInterceptor implements NestInterceptor {
  constructor(private readonly jobsService: JobsService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const dtoV3 = request.body as UpdateJobDtoV3;

    const id = request.params.id;
    const currentJob = await this.jobsService.findOne({ id: id });
    if (currentJob === null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid job id.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let newBody: UpdateJobDto = {
      statusCode: dtoV3.jobStatusMessage || currentJob.statusCode!,
      statusMessage: dtoV3.jobStatusMessage || currentJob.statusMessage!,
    };

    let newjobResultObject = dtoV3.jobResultObject;
    // if executionTime is provided, add it to jobResultObject, to maintain compatibility
    // after the job update is completed, it will be then moved to jobParams
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
