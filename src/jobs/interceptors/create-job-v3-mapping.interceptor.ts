import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { CreateJobDtoV3 } from "../dto/create-job.v3.dto";
import { CreateJobDto } from "../dto/create-job.dto";
import { DatasetListDto } from "../dto/dataset-list.dto";
import { UsersService } from "src/users/users.service";

interface JobParams {
  datasetList?: DatasetListDto[];
  executionTime?: Date;
  [key: string]: unknown;
}

/**
 * POST/api/v3/jobs requires a CreateJobDtoV3 object as request body.
 * This interceptor maps the CreateJobDtoV3 object to a CreateJobDto object,
 * to ensure compatibility with POST/api/v4/jobs.
 */
@Injectable()
export class CreateJobV3MappingInterceptor implements NestInterceptor {
  constructor(@Inject(UsersService) readonly usersService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const dtoV3 = request.body as CreateJobDtoV3;

    // ensure datasetList is a top level field in the dto and not included in jobParams
    if (
      dtoV3.jobParams &&
      Object.keys(dtoV3.jobParams).includes("datasetList")
    ) {
      delete dtoV3.jobParams.datasetList;
    }
    const jobParams: JobParams = {
      datasetList: dtoV3.datasetList ?? [],
      ...dtoV3.jobParams,
    };
    // to preserve the executionTime field, if provided, add it to jobParams
    if (dtoV3.executionTime) {
      jobParams.executionTime = dtoV3.executionTime;
    }

    let newBody: CreateJobDto = {
      type: dtoV3.type,
      jobParams: jobParams,
    };
    if (dtoV3.emailJobInitiator || request.user) {
      newBody = {
        ...newBody,
        contactEmail: dtoV3.emailJobInitiator ?? request.user.email,
        ownerGroup: "",
      };
    }
    // ensure compatibility with the FE, which provides the username field in jobParams
    // and compatibility the v4 which requires ownerUser and ownerGroup for jobs created by user
    if (Object.keys(jobParams).includes("username")) {
      const jobUser = await this.usersService.findByUsername2JWTUser(
        jobParams.username as string,
      );
      newBody = {
        ...newBody,
        ownerUser: jobUser?.username,
        ownerGroup: jobUser?.currentGroups[jobUser.currentGroups.length - 1],
      };
    }
    request.body = newBody;
    return next.handle();
  }
}
