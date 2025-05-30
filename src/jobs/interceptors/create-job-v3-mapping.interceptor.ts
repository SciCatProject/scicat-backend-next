import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { CreateJobDtoV3 } from "../dto/create-job.v3.dto";
import { CreateJobDto } from "../dto/create-job.dto";
import { DatasetListDto } from "../dto/dataset-list.dto";
import { UsersService } from "src/users/users.service";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobConfigService } from "src/config/job-config/jobconfig.service";

interface JobParams {
  datasetList: DatasetListDto[];
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
  constructor(
    @Inject(UsersService) readonly usersService: UsersService,
    @Inject(DatasetsService) readonly datasetsService: DatasetsService,
    @Inject(JobConfigService) readonly jobConfigService: JobConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest() as Request;
    const dtoV3 = request.body as CreateJobDtoV3;
    const requestUser = request.user as JWTUser;

    const jobConfig = this.jobConfigService.get(dtoV3.type);
    if (jobConfig) {
      // ensure datasetList comes from a top level field in the dto and not from jobParams
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
      // assign jobParams and contactEmail to the new body
      let newBody: CreateJobDto = {
        type: dtoV3.type,
        jobParams: jobParams,
      };
      if (dtoV3.emailJobInitiator || requestUser) {
        newBody = {
          ...newBody,
          contactEmail: dtoV3.emailJobInitiator ?? requestUser.email,
        };
      }
      // ensure compatibility with the FE, which provides the username field in jobParams
      // and compatibility with v4 which requires ownerUser in the dto of jobs created by normal users
      // if username is not provided, use the username from the request user
      let jobUser: JWTUser | null = null;
      if (Object.keys(jobParams).includes("username")) {
        const jwtUser = await this.usersService.findByUsername2JWTUser(
          jobParams.username as string,
        );
        jobUser = jwtUser;
      } else if (requestUser) {
        jobUser = requestUser;
      }
      if (jobUser) {
        newBody = {
          ...newBody,
          ownerUser: jobUser?.username,
        };
      }
      // ensure compatibility with v4 which requires ownerGroup in the dto of jobs created by normal user
      if (Object.keys(jobParams).includes("ownerGroup")) {
        newBody = {
          ...newBody,
          ownerGroup: jobParams.ownerGroup as string,
        };
      } else if (Array.isArray(jobParams.datasetList)) {
        if (jobConfig.create.auth === "#datasetAccess") {
          const datasetGroups = [];
          for (const datasetDto of jobParams.datasetList) {
            if (datasetDto.pid) {
              const dataset = await this.datasetsService.findOne({
                where: { pid: datasetDto.pid },
              });
              datasetGroups.push([
                ...(dataset?.accessGroups ?? []),
                dataset?.ownerGroup,
              ]);
            }
          }
          const commonGroups = intersection([
            ...datasetGroups,
            jobUser?.currentGroups ?? [],
          ]);
          if (commonGroups.length > 0) {
            newBody = {
              ...newBody,
              ownerGroup: commonGroups[0],
            };
          }
        } else if (jobConfig.create.auth !== "#datasetPublic") {
          if (jobParams.datasetList.length > 0) {
            const dataset = await this.datasetsService.findOne({
              where: { pid: jobParams.datasetList[0].pid },
            });
            newBody = {
              ...newBody,
              ownerGroup: dataset?.ownerGroup,
            };
          }
        }
      }
      request.body = newBody;
    }
    return next.handle();
  }
}

function intersection<T>(arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  return arrays.reduce((a, b) => {
    const setB = new Set(b);
    return a.filter((x) => setB.has(x));
  });
}
