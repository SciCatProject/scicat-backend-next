/**
 * Job configuration
 *
 * Upon startup, first modules and plugins implementing JobAction should register
 * themselves with the various `register*Action` methods.
 *
 * Calling `configuration()` from configuration.ts causes the JobConfig to be
 * instantiated for each job type (archive, retrieve, etc). The actions for this
 * JobConfig are also instantiated by calling `parse` on the registered action with
 * matching action type. This is passed the JSON configuration object.
 *
 * Upon receiving an API request to create, read, or update a job, all configured
 * actions for that job/action combination are called to first verify the request body
 * and then perform the appropriate action.
 */
import * as fs from "fs";
import { JobClass } from "../schemas/job.schema";
import { CreateJobDto } from "../dto/create-job.dto";
import { StatusUpdateJobDto } from "../dto/status-update-job.dto";
import { JobsConfigSchema } from "../types/jobs-config-schema.enum";
import { Action } from "src/casl/action.enum";
import { CreateJobAuth, JobsAuth } from "../types/jobs-auth.enum";
import Ajv from "ajv";
import { JobConfigSchema } from "./jobConfig.schema";
import { load } from "js-yaml";
import { SchemaFactory } from "@nestjs/mongoose";

export type JobDto = CreateJobDto | StatusUpdateJobDto;

/**
 * Encapsulates all responses to a particular job type (eg "archive")
 */
export class JobConfig {
  jobType: string;
  configVersion: string;
  create: JobOperation<CreateJobDto>;
  statusUpdate: JobOperation<StatusUpdateJobDto>;

  constructor(
    jobType: string,
    configVersion: string,
    create: JobOperation<CreateJobDto>,
    statusUpdate: JobOperation<StatusUpdateJobDto>,
  ) {
    this.jobType = jobType;
    this.configVersion = configVersion;
    this.create = create;
    this.statusUpdate = statusUpdate;
  }

  /**
   * Parse job configuration json by dispatching to currently registered JobActions
   * @param data JSON
   * @returns
   */

  static parse(
    jobData: Record<string, unknown>,
    configVersion: string,
  ): JobConfig {
    if (
      !(JobsConfigSchema.JobType in jobData) ||
      typeof jobData[JobsConfigSchema.JobType] !== "string"
    ) {
      throw new Error(`Invalid job type`);
    }
    const type = jobData[JobsConfigSchema.JobType] as string;
    if (!(Action.Create in jobData)) {
      throw new Error(`No ${Action.Create} configured for job type "${type}"`);
    }
    if (!(Action.StatusUpdate in jobData)) {
      throw new Error(
        `No ${Action.StatusUpdate} configured for job type "${type}"`,
      );
    }
    const create = JobOperation.parse<CreateJobDto>(
      createActions,
      jobData[Action.Create] as Record<string, unknown>,
    );
    const statusUpdate = JobOperation.parse<StatusUpdateJobDto>(
      statusUpdateActions,
      jobData[Action.StatusUpdate] as Record<string, unknown>,
    );
    return new JobConfig(type, configVersion, create, statusUpdate);
  }
}

/**
 * Encapsulates all information for a particular job operation (eg "create", "statusUpdate")
 */
export class JobOperation<DtoType extends JobDto> {
  auth: JobsAuth | undefined;
  actions: JobAction<DtoType>[];

  constructor(actions: JobAction<DtoType>[] = [], auth: JobsAuth | undefined) {
    this.actions = actions;
    this.auth = auth;
  }

  static parse<DtoType extends JobDto>(
    actionList: Record<string, JobActionClass<DtoType>>,
    data: Record<string, unknown>,
  ): JobOperation<DtoType> {
    // if Auth is not defined, default to #authenticated
    let auth: JobsAuth = CreateJobAuth.Authenticated;
    if (data[JobsConfigSchema.Auth]) {
      // don't bother to validate auth value
      if (typeof data[JobsConfigSchema.Auth] !== "string") {
        throw new Error(
          `Invalid auth value "${data[JobsConfigSchema.Auth]}" for job type`,
        );
      }
      auth = data[JobsConfigSchema.Auth] as JobsAuth;
    }
    let actionsData: unknown[] = [];
    if (JobsConfigSchema.Actions in data) {
      if (!Array.isArray(data[JobsConfigSchema.Actions])) {
        throw new Error(`Expected array for ${JobsConfigSchema.Actions} value`);
      }
      actionsData = data[JobsConfigSchema.Actions];
    }
    const actions = actionsData.map((json) => {
      if (typeof json !== "object") {
        throw new Error(`Expected object for job config action`);
      }
      return parseAction<DtoType>(actionList, json as Record<string, unknown>);
    });
    return new JobOperation<DtoType>(actions, auth);
  }
}

/**
 * Given a JSON object configuring a JobConfigAction.
 *
 * This is dispatched to registered constructors (see registerCreateAction) based on
 * the "actionType" field of data. Other parameters are action-specific.
 * @param data JSON configuration data
 * @returns
 */
function parseAction<DtoType extends JobDto>(
  actionList: Record<string, JobActionClass<DtoType>>,
  data: Record<string, unknown>,
): JobAction<DtoType> {
  if (!(JobsConfigSchema.ActionType in data))
    throw SyntaxError(`No action.actionType in ${JSON.stringify(data)}`);
  if (typeof data[JobsConfigSchema.ActionType] !== "string") {
    throw SyntaxError(`Expected string for ${JobsConfigSchema.ActionType}`);
  }
  const type = data[JobsConfigSchema.ActionType];
  if (!(type in actionList)) {
    throw SyntaxError(`No handler found for actions of type ${type}`);
  }

  const actionClass = actionList[type];
  return new actionClass(data);
}

/**
 * Superclass for all responses to Job changes
 */
export interface JobAction<DtoType extends JobDto> {
  /**
   * Validate that the request body for this job operation.
   *
   * Note that the configuration of this action is validated in the constructor.
   * Actions that don't need custom DTO methods can omit this method.
   *
   * @param dto data transfer object received from the client
   * @throw HttpException if the DTO is invalid
   * @returns
   */
  validate?: (dto: DtoType) => Promise<void>;

  /**
   * Respond to the action
   */
  performJob: (job: JobClass) => Promise<void>;

  /**
   * Return the actionType for this action. This should match the class's
   * static actionType (used for constructing the class from the configuration file)
   */
  getActionType(): string;
}

/**
 * Describes the constructor and static members for JobAction implementations
 */
export interface JobActionClass<DtoType extends JobDto> {
  /**
   * Action type, eg "url". Matched during parsing of the action
   */
  readonly actionType: string;
  new (json: Record<string, unknown>): JobAction<DtoType>;
}

export type JobCreateAction = JobAction<CreateJobDto>;
// export type JobReadAction = JobAction<ReadJobDto>;
export type JobStatusUpdateAction = JobAction<StatusUpdateJobDto>;

/**
 * Action registration
 */
const createActions: Record<string, JobActionClass<CreateJobDto>> = {};
const statusUpdateActions: Record<
  string,
  JobActionClass<StatusUpdateJobDto>
> = {};

/**
 * Registers an action to handle jobs of a particular type
 * @param action
 */
export function registerCreateAction(action: JobActionClass<CreateJobDto>) {
  createActions[action.actionType] = action;
}

export function registerStatusUpdateAction(
  action: JobActionClass<StatusUpdateJobDto>,
) {
  statusUpdateActions[action.actionType] = action;
}

/**
 * List of action types with a registered action
 * @returns
 */
export function getRegisteredCreateActions(): string[] {
  return Object.keys(createActions);
}

export function getRegisteredStatusUpdateActions(): string[] {
  return Object.keys(statusUpdateActions);
}

/**
 * Parsing
 */
let jobConfig: JobConfig[] | null = null; // singleton

/**
 * Load jobconfig.yaml (or json) file.
 * Expects one or more JobConfig configurations (see JobConfig.parse)
 * @param filePath path to json config file
 * @returns
 */
export function loadJobConfig(filePath: string): JobConfig[] {
  if (jobConfig !== null) {
    return jobConfig;
  }

  const yaml = fs.readFileSync(filePath, "utf8");
  const data = load(yaml, {filename:filePath});

  // Validate schema
  type JobConfigWrapper = { configVersion: string, jobs: Record<string, unknown>[] };
  const ajv = new Ajv();
  const validate = ajv.compile<JobConfigWrapper>(JobConfigSchema);

  if (!validate(data)) {
    throw new Error(`Invalid job configuration (${filePath}): ${JSON.stringify(validate.errors, null, 2)}`);
  }

  jobConfig = data.jobs.map((jobData) =>
    JobConfig.parse(jobData, data.configVersion),
  );
  return jobConfig as JobConfig[];
}
