import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import configuration from "src/config/configuration";
import { CreateJobDto } from "../dto/create-job.dto";
import { JobConfig } from "../config/jobconfig";

@Injectable()
export class JobCreateInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const jobConfiguration = await this.validateJob(req.body);

    req.body = {
      ...req.body,
      configuration: jobConfiguration,
    };

    return next.handle();
  }

  /**
   * Validate if the job has a matching configuration and is performable
   */
  async validateJob(createJobDto: CreateJobDto): Promise<JobConfig> {
    // it should return a single job configuration
    const jobConfigs = configuration().jobConfiguration;
    const matchingConfig = jobConfigs.filter(
      (j) => j.jobType == createJobDto.type,
    );

    if (matchingConfig.length != 1) {
      if (matchingConfig.length > 1) {
        Logger.error(
          "More than one job configurations matching type " + createJobDto.type,
        );
      } else {
        Logger.error("No job configuration matching type " + createJobDto.type);
      }
      // return error that job type does not exists
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid job type: " + createJobDto.type,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const jc = matchingConfig[0];

    await Promise.all(
      jc.create.actions.map((action) => {
        // return action.validate(createJobDto).catch((err) => {
        //   Logger.error(err);
        //   if (err instanceof HttpException) {
        //     throw err;
        //   }

        //   throw new HttpException(
        //     {
        //       status: HttpStatus.BAD_REQUEST,
        //       message: `Invalid job input. Action ${action.getActionType()} unable to validate ${
        //         createJobDto.type
        //       } job due to ${err}`,
        //     },
        //     HttpStatus.BAD_REQUEST,
        //   );
        // });
      }),
    );

    return jc;
  }
}
