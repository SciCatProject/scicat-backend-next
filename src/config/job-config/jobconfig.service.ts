import { Inject, Injectable } from "@nestjs/common";
import {
  CREATE_JOB_ACTION_CREATORS,
  JobActionCreator,
  JobConfig,
  JobConfigListOptions,
  JobConfigOptions,
  JobDto,
  JobOperation,
  JobOperationOptions,
  UPDATE_JOB_ACTION_CREATORS,
} from "./jobconfig.interface";
import Ajv from "ajv";
import { JobConfigSchema } from "./jobconfig.schema";
import { load } from "js-yaml";
import * as fs from "fs";
import { CreateJobDto } from "../../jobs/dto/create-job.dto";
import { UpdateJobDto } from "../../jobs/dto/update-job.dto";
import { ConfigService } from "@nestjs/config";

/**
 * Service representing a parsed jobconfig.yaml file.
 */
@Injectable()
export class JobConfigService {
  private readonly jobs: Record<string, JobConfig>;
  private readonly filePath: string;

  constructor(
    @Inject(CREATE_JOB_ACTION_CREATORS)
    private create_creators: Record<string, JobActionCreator<CreateJobDto>>,
    @Inject(UPDATE_JOB_ACTION_CREATORS)
    private update_creators: Record<string, JobActionCreator<UpdateJobDto>>,
    configService: ConfigService,
  ) {
    this.filePath = configService.get<string>("jobConfigurationFile") || "";
    this.jobs = this.loadJobConfig(this.filePath);
  }

  public get(jobType: string) {
    return this.jobs[jobType]; // TODO error handling
  }

  public get allJobConfigs(): Readonly<Record<string, JobConfig>> {
    return this.jobs;
  }

  /**
   * Load jobconfig.yaml (or json) file.
   * Expects one or more JobConfig configurations (see JobConfig.parse)
   * @param filePath path to json config file
   * @returns
   */
  private loadJobConfig(filePath: string): Record<string, JobConfig> {
    // If no file is given don't configure any jobs
    if (!filePath) {
      return {};
    }
    const yaml = fs.readFileSync(filePath, "utf8");
    const jobConfigListOptions = load(yaml, { filename: filePath });

    // TODO: Do we like the schema-based validation, or should it be pure typescript?
    const ajv = new Ajv();
    const validate = ajv.compile<JobConfigListOptions>(JobConfigSchema);

    if (!validate(jobConfigListOptions)) {
      throw new Error(
        `Invalid job configuration (${filePath}): ${JSON.stringify(validate.errors, null, 2)}`,
      );
    }

    // parse each JobConfig
    return jobConfigListOptions.jobs.reduce(
      (acc, jobConfigOptions) => {
        const jobConfig: JobConfig = this.parseJobConfig({
          ...jobConfigOptions,
          configVersion: jobConfigListOptions.configVersion,
        });
        if (jobConfig.jobType in acc) {
          throw new Error(
            `Duplicate job type ${jobConfig.jobType} in ${filePath}`,
          );
        }
        acc[jobConfig.jobType] = jobConfig;
        return acc;
      },
      {} as Record<string, JobConfig>,
    );
  }

  private parseJobConfig(options: JobConfigOptions): JobConfig {
    if (options.configVersion === undefined) {
      throw new Error(
        `No configVersion set for job type ${options.jobType} in ${this.filePath}`,
      );
    }
    return {
      jobType: options.jobType,
      configVersion: options.configVersion,
      create: this.parseJobOperation<CreateJobDto>(
        options.create,
        this.create_creators,
      ),
      update: this.parseJobOperation<UpdateJobDto>(
        options.update,
        this.update_creators,
      ),
    };
  }

  private parseJobOperation<Dto extends JobDto>(
    options: JobOperationOptions,
    creators: Record<string, JobActionCreator<Dto>>,
  ): JobOperation<Dto> {
    const actionOptions = options.actions || [];
    const actions = actionOptions.map((opt) => {
      if (!(opt.actionType in creators)) {
        throw new Error(
          `Unknown action type ${opt.actionType} in ${this.filePath}`,
        );
      }
      return creators[opt.actionType].create(opt);
    });
    return {
      auth: options.auth,
      actions: actions,
    };
  }
}
