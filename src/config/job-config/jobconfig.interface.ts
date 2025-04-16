import { CreateJobDto } from "../../jobs/dto/create-job.dto";
import { UpdateJobDto } from "../../jobs/dto/update-job.dto";
import { JobsAuth } from "../../jobs/types/jobs-auth.enum";
import { JobClass } from "../../jobs/schemas/job.schema";

// Nest Token for CREATE job actions
export const CREATE_JOB_ACTION_CREATORS = Symbol("CREATE_JOB_ACTION_CREATORS");
// Nest Token for UPDATE job actions
export const UPDATE_JOB_ACTION_CREATORS = Symbol("UPDATE_JOB_ACTION_CREATORS");

export interface JobConfigListOptions {
  configVersion: string;
  jobs: JobConfigOptions[];
}

/**
 * Encapsulates all responses to a particular job type (eg "archive")
 */
export interface JobConfig {
  jobType: string;
  configVersion: string;
  create: JobOperation<CreateJobDto>;
  update: JobOperation<UpdateJobDto>;
}
export interface JobConfigOptions {
  jobType: string;
  configVersion: string;
  create: JobOperationOptions;
  update: JobOperationOptions;
}

export type JobDto = CreateJobDto | UpdateJobDto;
/**
 * Encapsulates all information for a particular job operation (eg "create", "update")
 */
export interface JobOperation<DtoType extends JobDto> {
  auth: JobsAuth;
  actions: JobAction<DtoType>[];
}
export interface JobOperationOptions {
  auth: JobsAuth;
  actions?: JobActionOptions[];
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
export interface JobActionOptions {
  actionType: string;
}

/**
 * Represents a class that can create a JobAction after reading the jobConfigurationFile
 */
export type JobActionCreator<DtoType extends JobDto> = {
  create: (options: JobActionOptions) => JobAction<DtoType>;
};
