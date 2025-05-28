import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  HttpStatus,
  HttpException,
  Req,
  ForbiddenException,
  Version,
} from "@nestjs/common";
import { Request } from "express";
import { FilterQuery } from "mongoose";
import * as jmp from "json-merge-patch";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { DatasetListDto } from "./dto/dataset-list.dto";
import { CreateJobDtoV3 } from "./dto/create-job.v3.dto";
import { UpdateJobDtoV3 } from "./dto/update-job.v3.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { CreateJobAuth, UpdateJobAuth } from "src/jobs/types/jobs-auth.enum";
import { JobClass, JobDocument } from "./schemas/job.schema";
import { OutputJobV3Dto } from "./dto/output-job-v3.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobsConfigSchema } from "./types/jobs-config-schema.enum";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { AccessGroupsType } from "src/config/configuration";
import { Logger } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { FullFacetResponse } from "src/common/types";
import {
  filterDescriptionSimplified,
  filterExampleSimplified,
  fullQueryDescriptionLimits,
  fullQueryExampleLimits,
  jobsFullQueryExampleFields,
  jobsFullQueryDescriptionFields,
} from "src/common/utils";
import {
  JobConfig,
  validateActions,
  performActions,
} from "../config/job-config/jobconfig.interface";
import { JobParams } from "./types/job-types.enum";
import { IJobFields } from "./interfaces/job-filters.interface";
import { OrigDatablock } from "src/origdatablocks/schemas/origdatablock.schema";
import { ConfigService } from "@nestjs/config";
import { JobConfigService } from "../config/job-config/jobconfig.service";
import { CreateJobV3MappingInterceptor } from "./interceptors/create-job-v3-mapping.interceptor";
import { UpdateJobV3MappingInterceptor } from "./interceptors/update-job-v3-mapping.interceptor";

@ApiBearerAuth()
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  jobDatasetAuthorization: Array<string> = [];
  private accessGroups;

  constructor(
    private readonly jobsService: JobsService,
    private readonly datasetsService: DatasetsService,
    private readonly origDatablocksService: OrigDatablocksService,
    private caslAbilityFactory: CaslAbilityFactory,
    private readonly usersService: UsersService,
    private configService: ConfigService,
    private jobConfigService: JobConfigService,
  ) {
    this.jobDatasetAuthorization = Object.values(CreateJobAuth).filter((v) =>
      v.includes("#dataset"),
    );
    this.accessGroups =
      this.configService.get<AccessGroupsType>("accessGroups");
  }

  /**
   * Validate filter for GET
   */
  isFilterValid = (parsedFilterFields: string[]): boolean => {
    // Filter contains only valid values or is empty
    const validFields = ["where", "limits"];
    for (const item of parsedFilterFields) {
      if (!validFields.includes(item)) {
        return false;
      }
    }
    return true;
  };

  /**
   * Check that jobParams.datasetList is of valid type and contains valid values
   */
  async validateDatasetList(
    jobParams: Record<string, unknown>,
  ): Promise<DatasetListDto[]> {
    const datasetList = jobParams[
      JobParams.DatasetList
    ] as Array<DatasetListDto>;
    // check that datasetList is a non empty array
    if (!Array.isArray(datasetList)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid dataset list",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (datasetList.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "List of passed datasets is empty.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // check that datasetList is of type DatasetListDto[]
    const datasetListDtos: DatasetListDto[] = datasetList.map((item) => {
      return Object.assign(new DatasetListDto(), item);
    });
    const allowedKeys = [JobParams.Pid, JobParams.Files] as string[];
    for (const datasetListDto of datasetListDtos) {
      const keys = Object.keys(datasetListDto);
      if (
        keys.length !== 2 ||
        !keys.every((key) => allowedKeys.includes(key))
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message:
              "Dataset list is expected to contain sets of pid and files.",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (typeof datasetListDto[JobParams.Pid] !== "string") {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "In datasetList each 'pid' field should be a string.",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Array.isArray(datasetListDto[JobParams.Files])) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "In datasetList each 'files' field should be an array.",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // check that all requested pids exist
    await this.checkDatasetPids(datasetListDtos);
    // check that all requested files exist
    await this.checkDatasetFiles(datasetListDtos);

    return datasetListDtos;
  }

  /**
   * Check that the dataset pids are valid
   */
  async checkDatasetPids(datasetList: DatasetListDto[]): Promise<void> {
    interface condition {
      where: {
        pid: { $in: string[] };
      };
    }

    const datasetIds = datasetList.map((x) => x.pid);
    const filter: condition = {
      where: {
        pid: { $in: datasetIds },
      },
    };

    const findDatasetsById = await this.datasetsService.findAll(filter);
    const findIds = findDatasetsById.map(({ pid }) => pid);
    const nonExistIds = datasetIds.filter((x) => !findIds.includes(x));

    if (nonExistIds.length != 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Datasets with pid ${nonExistIds} do not exist.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return;
  }

  /**
   * Check that the dataset files are valid
   */
  async checkDatasetFiles(datasetList: DatasetListDto[]): Promise<void> {
    const datasetsToCheck = datasetList.filter((x) => x.files.length > 0);
    const ids = datasetsToCheck.map((x) => x.pid);
    if (ids.length > 0) {
      const filter = {
        fields: {
          pid: true,
          datasetId: true,
          dataFileList: true,
        },
        where: {
          pid: {
            $in: ids,
          },
        },
      };
      // Indexing originDataBlock with pid and create set of files for each dataset
      const datasets = await this.datasetsService.findAll(filter);
      // Include origdatablocks
      let datasetOrigDatablocks: OrigDatablock[] = [];
      await Promise.all(
        datasets.map(async (dataset) => {
          datasetOrigDatablocks = await this.origDatablocksService.findAll({
            datasetId: dataset.pid,
          });
        }),
      );
      const result: Record<string, Set<string>> = datasets.reduce(
        (acc: Record<string, Set<string>>, dataset) => {
          // Using Set make searching more efficient
          const files = datasetOrigDatablocks.reduce((acc, block) => {
            block.dataFileList.forEach((file) => {
              acc.add(file.path);
            });
            return acc;
          }, new Set<string>());
          acc[dataset.pid] = files;
          return acc;
        },
        {},
      );
      // Get a list of requested files that were not found
      const checkResults = datasetsToCheck.reduce(
        (acc: { pid: string; nonExistFiles: string[] }[], x) => {
          const pid = x.pid;
          const referenceFiles = result[pid];
          const nonExistFiles = x.files.filter((f) => !referenceFiles.has(f));
          if (nonExistFiles.length > 0) {
            acc.push({ pid, nonExistFiles });
          }
          return acc;
        },
        [],
      );
      if (checkResults.length > 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "At least one requested file could not be found.",
            error: JSON.stringify(
              checkResults.map(({ pid, nonExistFiles }) => ({
                pid,
                nonExistFiles,
              })),
            ),
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return;
  }

  /**
   * Create instance of JobClass to check permissions
   */
  async generateJobInstanceForPermissions(job: JobClass): Promise<JobClass> {
    const jobInstance = new JobClass();
    jobInstance._id = job._id;
    jobInstance.id = job.id;
    jobInstance.type = job.type;
    jobInstance.ownerGroup = job.ownerGroup;
    jobInstance.ownerUser = job.ownerUser;
    return jobInstance;
  }

  /**
   * Check job type matching configuration
   */
  getJobTypeConfiguration = (jobType: string) => {
    const jobConfig = this.jobConfigService.get(jobType);
    if (!jobConfig) {
      // return error that job type does not exists
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid job type: " + jobType,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return jobConfig;
  };

  /**
   * Checking if user is allowed to create job according to auth field of job configuration
   */
  async instanceAuthorizationJobCreate(
    jobCreateDto: CreateJobDto,
    user: JWTUser,
  ): Promise<JobClass> {
    // NOTE: We need JobClass instance because casl module works only on that.
    // If other fields are needed can be added later.
    const jobInstance = new JobClass();
    const jobConfiguration = this.getJobTypeConfiguration(jobCreateDto.type);
    jobInstance._id = "";
    jobInstance.accessGroups = [];
    jobInstance.type = jobCreateDto.type;
    if (jobCreateDto.contactEmail) {
      jobInstance.contactEmail = jobCreateDto.contactEmail;
    }
    jobInstance.jobParams = jobCreateDto.jobParams;
    jobInstance.configVersion =
      jobConfiguration[JobsConfigSchema.ConfigVersion];
    jobInstance.statusCode = this.configService.get<string>(
      "jobDefaultStatusCode",
    )!;

    jobInstance.statusMessage = this.configService.get<string>(
      "jobDefaultStatusMessage",
    )!;

    // validate datasetList, if it exists in jobParams
    let datasetList: DatasetListDto[] = [];

    let datasetsNoAccess = 0;
    if (JobParams.DatasetList in jobCreateDto.jobParams) {
      datasetList = await this.validateDatasetList(jobCreateDto.jobParams);
      jobInstance.jobParams = {
        ...jobInstance.jobParams,
        [JobParams.DatasetList]: datasetList,
      };
    }
    let jobUser: JWTUser | null = null;
    if (user) {
      // the request comes from a user who is logged in.
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g)) ||
        user.currentGroups.some((g) =>
          this.accessGroups?.createJobPrivileged.includes(g),
        )
      ) {
        // admin users and users  in CREATE_JOB_PRIVILEGED group
        if (jobCreateDto.ownerUser) {
          if (user.username != jobCreateDto.ownerUser) {
            jobUser = await this.usersService.findByUsername2JWTUser(
              jobCreateDto.ownerUser,
            );
            if (jobUser === null) {
              Logger.log(
                "Owner user was not found, using current user instead.",
                "instanceAuthorizationJobCreate",
              );
            }
            jobInstance.ownerUser =
              (jobUser?.username as string) ?? user.username;
          } else {
            jobInstance.ownerUser = user.username;
          }
        }
        if (jobCreateDto.ownerGroup) {
          // TODO?: ensure that the provided ownerGroup exists
          jobInstance.ownerGroup = jobCreateDto.ownerGroup;
        }
        if (
          !jobCreateDto.ownerGroup &&
          !jobCreateDto.ownerUser &&
          !jobCreateDto.contactEmail
        ) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message:
                "Contact email should be specified for an anonymous job.",
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        // prioritize jobCreateDto.contactEmail for anonymous users
        jobInstance.contactEmail =
          jobCreateDto.contactEmail ?? (jobUser?.email as string) ?? user.email;
      } else {
        // check if we have ownerGroup
        if (!jobCreateDto.ownerGroup) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: `Invalid new job. Owner group should be specified.`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        // check that job user matches the user placing the request, if job user is specified
        if (jobCreateDto.ownerUser && jobCreateDto.ownerUser != user.username) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: `Invalid new job. User owning the job should match user logged in.`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        jobInstance.ownerUser = user.username;
        jobInstance.contactEmail = jobCreateDto.contactEmail ?? user.email;
        // check that ownerGroup is one of the user groups
        if (!user.currentGroups.includes(jobCreateDto.ownerGroup)) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: `Invalid new job. User needs to belong to job owner group.`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        jobInstance.ownerGroup = jobCreateDto.ownerGroup;
      }
    }

    if (
      jobConfiguration.create.auth &&
      Object.values(this.jobDatasetAuthorization).includes(
        jobConfiguration.create.auth,
      )
    ) {
      // check that jobParams are passed for #dataset jobs
      if (!(JobParams.DatasetList in jobCreateDto.jobParams)) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Dataset ids list was not provided in jobParams",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // verify that the user meet the requested permissions on the datasets listed
      // build the condition
      type FieldFilter = { $eq?: string; $in?: string[] };
      type BasicCondition = { [field: string]: FieldFilter | boolean };

      type LogicalCondition =
        | { $and: BasicCondition[] }
        | { $or: BasicCondition[] };

      interface datasetsWhere {
        where: {
          pid: { $in: string[] };
          isPublished?: boolean;
          ownerGroup?: FieldFilter;
          $or?: (BasicCondition | LogicalCondition)[];
        };
      }

      const datasetIds = datasetList.map((x) => x.pid);
      const datasetsWhere: datasetsWhere = {
        where: {
          pid: { $in: datasetIds },
        },
      };
      if (jobConfiguration.create.auth === "#datasetPublic") {
        datasetsWhere["where"]["isPublished"] = true;
      } else if (jobConfiguration.create.auth === "#datasetAccess") {
        // jobAdmin creates job for someone and ownerUser not specified, only ownerGroup or
        // user creating the job and ownerUser are the same or
        // ownerUser specified in the DTO is part of ownerGroup specified in the DTO
        if (
          (!jobUser && jobInstance.ownerGroup) ||
          (jobUser && user.username === jobUser.username) ||
          (jobUser && jobUser.currentGroups.includes(jobInstance.ownerGroup))
        ) {
          datasetsWhere["where"]["$or"] = [
            { ownerGroup: { $eq: jobInstance.ownerGroup } },
            { accessGroups: { $eq: jobInstance.ownerGroup } },
            { isPublished: true },
          ];
        } else if (jobUser && !jobInstance.ownerGroup) {
          // job for user with no ownerGroup specified
          datasetsWhere["where"]["$or"] = [
            { ownerGroup: { $in: jobUser.currentGroups } },
            { accessGroups: { $in: jobUser.currentGroups } },
            { isPublished: true },
          ];
        }
        // job for different user and group
        else if (
          jobUser &&
          !jobUser.currentGroups.includes(jobInstance.ownerGroup)
        ) {
          // check that both the user and group have access to datasets
          datasetsWhere["where"]["$or"] = [
            {
              $and: [
                { ownerGroup: { $eq: jobInstance.ownerGroup } },
                { ownerGroup: { $in: jobUser.currentGroups } },
              ],
            },
            {
              $and: [
                { accessGroups: { $eq: jobInstance.ownerGroup } },
                { accessGroups: { $in: jobUser.currentGroups } },
              ],
            },
            { isPublished: true },
          ];
        } else {
          // job for anonymous user
          datasetsWhere["where"]["isPublished"] = true;
        }
      } else if (jobConfiguration.create.auth === "#datasetOwner") {
        if (
          !user ||
          (!user.currentGroups.some((g) =>
            this.accessGroups?.admin.includes(g),
          ) &&
            !jobCreateDto.ownerGroup &&
            !jobCreateDto.ownerUser)
        ) {
          throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              message: "User not authenticated",
            },
            HttpStatus.UNAUTHORIZED,
          );
        }

        if (
          (!jobUser && jobInstance.ownerGroup) ||
          (jobUser && user.username === jobUser.username) ||
          (jobUser && jobUser.currentGroups.includes(jobInstance.ownerGroup))
        ) {
          datasetsWhere["where"]["ownerGroup"] = {
            $eq: jobInstance.ownerGroup,
          };
        } else if (jobUser && !jobInstance.ownerGroup) {
          // job for user with no ownerGroup specified
          datasetsWhere["where"]["ownerGroup"] = { $in: jobUser.currentGroups };
        } else if (
          // job for different user and group
          jobUser &&
          !jobUser.currentGroups.includes(jobInstance.ownerGroup)
        ) {
          // check that both the user and group have access to datasets
          datasetsWhere["where"]["$or"] = [
            {
              $and: [
                { ownerGroup: { $eq: jobInstance.ownerGroup } },
                { ownerGroup: { $in: jobUser.currentGroups } },
              ],
            },
          ];
        } else {
          // job for anonymous user is always faulty, because job id cannot be empty
          datasetsWhere["where"]["$or"] = [{ _id: { $in: [] } }];
        }
      }
      const numberOfDatasetsWithAccess =
        await this.datasetsService.count(datasetsWhere);
      datasetsNoAccess = datasetIds.length - numberOfDatasetsWithAccess.count;
    }

    if (!user && jobCreateDto.ownerGroup) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Invalid new job. Unauthenticated user cannot initiate a job owned by another user.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // instantiate the casl matrix for the user
    const ability = this.caslAbilityFactory.jobsInstanceAccess(
      user,
      jobConfiguration,
    );
    // check if the user can create this job
    const canCreate =
      (ability.can(Action.JobCreateAny, JobClass) &&
        user.currentGroups.includes("admin")) ||
      (ability.can(Action.JobCreateAny, JobClass) && datasetsNoAccess == 0) ||
      ability.can(Action.JobCreateOwner, jobInstance) ||
      (ability.can(Action.JobCreateConfiguration, jobInstance) &&
        datasetsNoAccess == 0 &&
        jobConfiguration.create.auth != CreateJobAuth.JobAdmin);

    if (!canCreate) {
      throw new ForbiddenException("Unauthorized to create this job.");
    }

    return jobInstance;
  }

  /**
   * Check for mismatches between the config version used to create the job and the currently loaded version.
   *
   * Currently this is only logged.
   * @param jobInstance
   * @returns
   */
  async checkConfigVersion(
    jobConfig: JobConfig,
    jobInstance: JobClass,
  ): Promise<void> {
    // Give a warning when configVersion does not match
    if (jobConfig.configVersion !== jobInstance.configVersion) {
      Logger.log(
        `
          Job was created with configVersion ${jobInstance.configVersion}.
          Current configVersion is ${jobConfig.configVersion}.
        `,
        "JobUpdate",
      );
    }
  }

  /**
   * Transform a v4 job instance so that is compatible with v3
   * @param job: a JobClass instance (v4)
   * @returns a OutputJobV3Dto instance
   */
  private mapJobClassV4toV3(job: JobClass): OutputJobV3Dto {
    const jobV3 = new OutputJobV3Dto();
    // Map fields from v4 to v3
    jobV3._id = job._id;
    jobV3.id = job.id;
    jobV3.emailJobInitiator = job.contactEmail;
    jobV3.type = job.type;
    jobV3.creationTime = job.createdAt;
    jobV3.jobStatusMessage = job.statusCode;
    jobV3.jobResultObject = job.jobResultObject;
    // Extract datasetList from jobParams
    const { datasetList, ...jobParams } = job.jobParams;
    jobV3.datasetList = datasetList as DatasetListDto[];
    jobV3.jobParams = jobParams;
    // Extract executionTime from jobParams
    if (job.jobParams.executionTime) {
      const { datasetList, executionTime, ...jobParams } = job.jobParams;
      jobV3.datasetList = datasetList as DatasetListDto[];
      jobV3.executionTime = executionTime as Date;
      jobV3.jobParams = jobParams;
    }
    return jobV3;
  }

  /**
   * Create job implementation
   */
  private async createJob(
    request: Request,
    createJobDto: CreateJobDto,
  ): Promise<JobClass | null> {
    Logger.debug("Creating job", "JobsController");
    // Validate that request matches the current configuration
    // Check job authorization
    const jobInstance = await this.instanceAuthorizationJobCreate(
      createJobDto,
      request.user as JWTUser,
    );
    // Allow actions to validate DTO
    const jobConfig = this.getJobTypeConfiguration(createJobDto.type);
    const validateContext = { request: createJobDto, env: process.env };
    await validateActions(jobConfig.create.actions, validateContext);
    // Create actual job in database
    const createdJobInstance = await this.jobsService.create(jobInstance);
    // Perform the action that is specified in the create portion of the job configuration
    const performContext = { ...validateContext, job: createdJobInstance };
    await performActions(jobConfig.create.actions, performContext);
    return createdJobInstance;
  }

  /**
   * Create job v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobCreate, JobClass),
  )
  @UseInterceptors(CreateJobV3MappingInterceptor)
  @Post()
  @Version("3")
  @ApiOperation({
    summary: "It creates a new job.",
    description: "It creates a new job.",
  })
  @ApiBody({
    description: "Input fields for the job to be created.",
    required: true,
    type: CreateJobDtoV3,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: OutputJobV3Dto,
    description: "Created job",
  })
  async createV3(
    @Req() request: Request,
    @Body() createJobDto: CreateJobDto,
  ): Promise<OutputJobV3Dto | null> {
    const job = await this.createJob(request, createJobDto);
    return job ? this.mapJobClassV4toV3(job) : null;
  }

  /**
   * Create job v4
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobCreate, JobClass),
  )
  @Post()
  @Version("4")
  @ApiOperation({
    summary: "It creates a new job.",
    description: "It creates a new job.",
  })
  @ApiBody({
    description: "Input fields for the job to be created",
    required: true,
    type: CreateJobDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: JobClass,
    description: "Created job",
  })
  async createV4(
    @Req() request: Request,
    @Body() createJobDto: CreateJobDto,
  ): Promise<JobClass | null> {
    return this.createJob(request, createJobDto);
  }

  /**
   * Update job implementation
   */
  private async updateJob(
    request: Request,
    id: string,
    updateJobDto: UpdateJobDto,
  ): Promise<JobClass | null> {
    Logger.log("updating job ", id);
    // Find existing job
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
    const currentJobInstance =
      await this.generateJobInstanceForPermissions(currentJob);
    const jobConfig = this.getJobTypeConfiguration(currentJob.type);
    const ability = this.caslAbilityFactory.jobsInstanceAccess(
      request.user as JWTUser,
      jobConfig,
    );
    // check if the user can update this job
    const canUpdate =
      ability.can(Action.JobUpdateAny, JobClass) ||
      ability.can(Action.JobUpdateOwner, currentJobInstance) ||
      (ability.can(Action.JobUpdateConfiguration, currentJobInstance) &&
        jobConfig.update.auth != UpdateJobAuth.JobAdmin);
    if (!canUpdate) {
      throw new ForbiddenException("Unauthorized to update this job.");
    }

    // Allow actions to validate DTO
    const validateContext = {
      request: updateJobDto,
      job: currentJob,
      env: process.env,
    };
    await validateActions(jobConfig.update.actions, validateContext);

    const updateJobDtoForService =
      request.headers["content-type"] === "application/merge-patch+json"
        ? jmp.apply(currentJob, updateJobDto)
        : updateJobDto;

    // Update job in database
    const updatedJob = await this.jobsService.update(
      id,
      updateJobDtoForService,
    );
    // Perform the action that is specified in the update portion of the job configuration
    if (updatedJob !== null) {
      await this.checkConfigVersion(jobConfig, updatedJob);
      const performContext = { ...validateContext, job: updatedJob };
      await performActions(jobConfig.update.actions, performContext);
    }
    return updatedJob;
  }

  /**
   * Update job v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobUpdate, JobClass),
  )
  @UseInterceptors(UpdateJobV3MappingInterceptor)
  @Patch(":id")
  @Version("3")
  @ApiOperation({
    summary: "It updates an existing job.",
    description: "It updates an existing job.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the job to be modified.",
    type: String,
  })
  @ApiBody({
    description: "Fields for the job to be updated",
    required: true,
    type: UpdateJobDtoV3,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputJobV3Dto,
    description: "Updated job",
  })
  async updateV3(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<OutputJobV3Dto | null> {
    Logger.log("Updating job v3 ", id);
    const updatedJob = await this.updateJob(request, id, updateJobDto);
    return updatedJob ? this.mapJobClassV4toV3(updatedJob) : null;
  }

  /**
   * Update job v4
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobUpdate, JobClass),
  )
  @Patch(":id")
  @Version("4")
  @ApiOperation({
    summary: "It updates an existing job.",
    description:
      "It updates an existing job. Set `content-type` to `application/merge-patch+json` if you would like to update nested objects. Warning! `application/merge-patch+json` doesn’t support updating a specific item in an array — the result will always replace the entire target if it’s not an object.",
  })
  @ApiConsumes("application/json", "application/merge-patch+json")
  @ApiParam({
    name: "id",
    description: "Id of the job to be modified.",
    type: String,
  })
  @ApiBody({
    description: "Fields for the job to be updated",
    required: true,
    type: UpdateJobDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobClass,
    description: "Updated job",
  })
  async updateV4(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<JobClass | null> {
    return await this.updateJob(request, id, updateJobDto);
  }

  /**
   * FullQuery implementation
   */
  private async fullQueryJobs(
    request: Request,
    filters: { fields?: string; limits?: string },
  ): Promise<JobClass[] | null> {
    try {
      const parsedFilters: IFilters<JobDocument, FilterQuery<JobDocument>> = {
        fields: JSON.parse(filters.fields ?? ("{}" as string)),
        limits: JSON.parse(filters.limits ?? ("{}" as string)),
      };
      const jobsFound = await this.jobsService.findByFilters(
        parsedFilters.fields,
      );
      const jobsAccessible: JobClass[] = [];

      // for each job run a casl JobReadOwner on a jobInstance
      if (jobsFound != null) {
        for (const i in jobsFound) {
          const jobConfiguration = this.getJobTypeConfiguration(
            jobsFound[i].type,
          );
          const ability = this.caslAbilityFactory.jobsInstanceAccess(
            request.user as JWTUser,
            jobConfiguration,
          );
          // check if the user can get this job
          const jobInstance = await this.generateJobInstanceForPermissions(
            jobsFound[i],
          );
          const canRead =
            ability.can(Action.JobReadAny, JobClass) ||
            ability.can(Action.JobReadAccess, jobInstance);
          if (canRead) {
            jobsAccessible.push(jobsFound[i]);
          }
        }
      }
      return this.jobsService.applyFilterLimits(
        jobsAccessible,
        parsedFilters.limits,
      );
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: (e as Error).message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get fullquery v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get("/fullquery")
  @Version("3")
  @ApiOperation({
    summary: "It returns a list of jobs matching the query provided.",
    description: "It returns a list of jobs matching the query provided.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Filters to apply when retrieving jobs.\n" +
      jobsFullQueryDescriptionFields,
    required: false,
    type: String,
    example: jobsFullQueryExampleFields,
  })
  @ApiQuery({
    name: "limits",
    description:
      "Define further query parameters like skip, limit, order.\n" +
      fullQueryDescriptionLimits,
    required: false,
    type: String,
    example: fullQueryExampleLimits,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [OutputJobV3Dto],
    description: "Return jobs requested.",
  })
  async fullQueryV3(
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<OutputJobV3Dto[] | null> {
    const jobs = await this.fullQueryJobs(request, filters);
    return jobs?.map(this.mapJobClassV4toV3) ?? null;
  }

  /**
   * Get fullquery v4
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get("/fullquery")
  @Version("4")
  @ApiOperation({
    summary: "It returns a list of jobs matching the query provided.",
    description: "It returns a list of jobs matching the query provided.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Filters to apply when retrieving jobs.\n" +
      jobsFullQueryDescriptionFields,
    required: false,
    type: String,
    example: jobsFullQueryExampleFields,
  })
  @ApiQuery({
    name: "limits",
    description:
      "Define further query parameters like skip, limit, order.\n" +
      fullQueryDescriptionLimits,
    required: false,
    type: String,
    example: fullQueryExampleLimits,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [JobClass],
    description: "Return jobs requested.",
  })
  async fullQueryV4(
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<JobClass[] | null> {
    return this.fullQueryJobs(request, filters);
  }

  /**
   * FullFacet implementation
   */
  private async fullFacetJobs(
    request: Request,
    filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    try {
      const fields: IJobFields = JSON.parse(filters.fields ?? ("{}" as string));
      const jobsFound = await this.fullQueryJobs(request, filters);
      const jobIdsAccessible: string[] = [];
      if (jobsFound != null) {
        for (const i in jobsFound) {
          jobIdsAccessible.push(jobsFound[i]._id);
        }
      }
      fields._id = { $in: jobIdsAccessible };
      const facetFilters: IFacets<IJobFields> = {
        fields: fields,
        facets: JSON.parse(filters.facets ?? ("[]" as string)),
      };
      return await this.jobsService.fullfacet(facetFilters);
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: (e as Error).message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get fullfacet v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get("/fullfacet")
  @Version("3")
  @ApiOperation({
    summary: "It returns a list of job facets matching the filter provided.",
    description:
      "It returns a list of job facets matching the filter provided.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Define the filter conditions by specifying the values of fields requested.\n" +
      jobsFullQueryDescriptionFields,
    required: false,
    type: String,
    example: jobsFullQueryExampleFields,
  })
  @ApiQuery({
    name: "facets",
    description:
      "Define a list of field names, for which facet counts should be calculated.",
    required: false,
    type: String,
    example: '["type","ownerGroup","statusCode"]',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FullFacetResponse,
    isArray: true,
    description: "Return fullfacet response for jobs requested.",
  })
  async fullFacetV3(
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    return this.fullFacetJobs(request, filters);
  }

  /**
   * Get fullfacet v4
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get("/fullfacet")
  @Version("4")
  @ApiOperation({
    summary: "It returns a list of job facets matching the filter provided.",
    description:
      "It returns a list of job facets matching the filter provided.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Define the filter conditions by specifying the values of fields requested.\n" +
      jobsFullQueryDescriptionFields,
    required: false,
    type: String,
    example: jobsFullQueryExampleFields,
  })
  @ApiQuery({
    name: "facets",
    description:
      "Define a list of field names, for which facet counts should be calculated.",
    required: false,
    type: String,
    example: '["type","ownerGroup","statusCode"]',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FullFacetResponse,
    isArray: true,
    description: "Return fullfacet response for jobs requested.",
  })
  async fullFacetV4(
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    return this.fullFacetJobs(request, filters);
  }

  /**
   * Get job by id implementation
   */
  private async getJobById(
    request: Request,
    id: string,
  ): Promise<JobClass | null> {
    const currentJob = await this.jobsService.findOne({ _id: id });
    if (currentJob === null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid job id.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const currentJobInstance =
      await this.generateJobInstanceForPermissions(currentJob);

    const jobConfiguration = this.getJobTypeConfiguration(currentJob.type);
    const ability = this.caslAbilityFactory.jobsInstanceAccess(
      request.user as JWTUser,
      jobConfiguration,
    );
    const canRead =
      ability.can(Action.JobReadAny, JobClass) ||
      ability.can(Action.JobReadAccess, currentJobInstance);
    if (!canRead) {
      throw new ForbiddenException("Unauthorized to get this job.");
    }
    return currentJob;
  }

  /**
   * Get job by id v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get(":id")
  @Version("3")
  @ApiOperation({
    summary: "It returns the requested job.",
    description: "It returns the requested job.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the job to be retrieved.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputJobV3Dto,
    description: "Found job",
  })
  async findOneV3(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<OutputJobV3Dto | null> {
    const job = await this.getJobById(request, id);
    return job ? this.mapJobClassV4toV3(job) : null;
  }

  /**
   * Get job by id v4
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get(":id")
  @Version("4")
  @ApiOperation({
    summary: "It returns the requested job.",
    description: "It returns the requested job.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the job to be retrieved.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobClass,
    description: "Found job",
  })
  async findOneV4(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<JobClass | null> {
    return this.getJobById(request, id);
  }

  /**
   * Get jobs implementation
   */
  private async getJobs(
    request: Request,
    filter?: string,
  ): Promise<JobClass[]> {
    try {
      filter = filter ?? "{}";
      JSON.parse(filter as string);
      // filter is a valid JSON, continue with parsing
      const parsedFilter: IFilters<
        JobDocument,
        FilterQuery<JobDocument>
      > = JSON.parse(filter);

      if (!this.isFilterValid(Object.keys(parsedFilter))) {
        throw { message: "Invalid filter syntax." };
      }
      // for each job run a casl JobReadOwner on a jobInstance
      const jobsFound = await this.jobsService.findByFilters(
        parsedFilter.where,
      );
      const jobsAccessible: JobClass[] = [];

      for (const i in jobsFound) {
        const jobConfiguration = this.getJobTypeConfiguration(
          jobsFound[i].type,
        );
        const ability = this.caslAbilityFactory.jobsInstanceAccess(
          request.user as JWTUser,
          jobConfiguration,
        );
        // check if the user can get this job
        const jobInstance = await this.generateJobInstanceForPermissions(
          jobsFound[i],
        );
        const canRead =
          ability.can(Action.JobReadAny, JobClass) ||
          ability.can(Action.JobReadAccess, jobInstance);
        if (canRead) {
          jobsAccessible.push(jobsFound[i]);
        }
      }
      return this.jobsService.applyFilterLimits(
        jobsAccessible,
        parsedFilter.limits,
      );
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: (e as Error).message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get jobs v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get()
  @Version("3")
  @ApiOperation({
    summary: "It returns a list of jobs.",
    description:
      "It returns a list of jobs. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Filters to apply when retrieve all jobs\n" + filterDescriptionSimplified,
    required: false,
    type: String,
    example: filterExampleSimplified,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [OutputJobV3Dto],
    description: "Found jobs",
  })
  async findAllV3(
    @Req() request: Request,
    @Query("filter") filter?: string,
  ): Promise<OutputJobV3Dto[]> {
    const jobs = await this.getJobs(request, filter);
    return jobs?.map(this.mapJobClassV4toV3) ?? ([] as OutputJobV3Dto[]);
  }

  /**
   * Get jobs v4
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get()
  @Version("4")
  @ApiOperation({
    summary: "It returns a list of jobs.",
    description:
      "It returns a list of jobs. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Filters to apply when retrieve all jobs\n" + filterDescriptionSimplified,
    required: false,
    type: String,
    example: filterExampleSimplified,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [JobClass],
    description: "Found jobs",
  })
  async findAllV4(
    @Req() request: Request,
    @Query("filter") filter?: string,
  ): Promise<JobClass[]> {
    return this.getJobs(request, filter);
  }

  /**
   * Delete a job v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobDelete, JobClass),
  )
  @Delete(":id")
  @Version("3")
  @ApiOperation({
    summary: "It deletes the requested job.",
    description: "It deletes the requested job.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the job to be deleted.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: undefined,
    description: "Deleted job",
  })
  async removeV3(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<unknown> {
    const foundJob = await this.jobsService.findOne({ _id: id });
    if (foundJob === null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Job id ${id} doesn't exist.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    Logger.log(`Deleting job with id ${id}!`);
    return this.jobsService.remove({ _id: id });
  }

  /**
   * Delete a job v4
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobDelete, JobClass),
  )
  @Delete(":id")
  @Version("4")
  @ApiOperation({
    summary: "It deletes the requested job.",
    description: "It deletes the requested job.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the job to be deleted.",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: undefined,
    description: "Deleted job",
  })
  async removeV4(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<unknown> {
    const foundJob = await this.jobsService.findOne({ _id: id });
    if (foundJob === null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Job id ${id} doesn't exist.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    Logger.log(`Deleting job with id ${id}!`);
    return this.jobsService.remove({ _id: id });
  }
}
