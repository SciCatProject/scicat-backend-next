import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpException,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";
import { FilterQuery } from "mongoose";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { StatusUpdateJobDto } from "./dto/status-update-job.dto";
import { DatasetListDto } from "./dto/dataset-list.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { CreateJobAuth } from "src/jobs/types/jobs-auth.enum";
import { JobClass, JobDocument } from "./schemas/job.schema";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobsConfigSchema } from "./types/jobs-config-schema.enum";
import configuration from "src/config/configuration";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { Logger } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import {
  filterDescriptionSimplified,
  filterExampleSimplified,
  fullQueryDescriptionLimits,
  fullQueryExampleLimits,
  jobsFullQueryExampleFields,
  jobsFullQueryDescriptionFields,
} from "src/common/utils";
import { JobAction } from "./config/jobconfig";
import { JobType, DatasetState, JobParams } from "./types/job-types.enum";
import { IJobFields } from "./interfaces/job-filters.interface";

@ApiBearerAuth()
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  jobDatasetAuthorization: Array<string> = [];

  constructor(
    private readonly jobsService: JobsService,
    private readonly datasetsService: DatasetsService,
    private readonly origDatablocksService: OrigDatablocksService,
    private caslAbilityFactory: CaslAbilityFactory,
    private readonly usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {
    this.jobDatasetAuthorization = Object.values(CreateJobAuth).filter((v) =>
      v.includes("#dataset"),
    );
  }

  publishJob() {
    if (configuration().rabbitMq.enabled) {
      // TODO: This should publish the job to the message broker.
      // job.publishJob(ctx.instance, "jobqueue");
      console.log("Saved Job %s#%s and published to message broker");
    }
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
    jobType: string,
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
    const datasetListDtos: DatasetListDto[] = datasetList.map(item => {
      return Object.assign(new DatasetListDto(), (item));
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
            message: "Dataset list is expected to contain sets of pid and files.",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // check that all requested pids exist
    await this.checkDatasetPids(datasetListDtos);
    // check that dataset state is compatible with the job type
    await this.checkDatasetState(datasetListDtos, jobType);
    // check that all requested files exist
    await this.checkDatasetFiles(datasetListDtos, jobType);

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
   * Check that datasets are in a state at which the job can be performed:
   * For retrieve jobs all datasets must be in state retrievable
   * For archive jobs all datasets must be in state archivable
   * For public jobs all datasets must be published
   */
  async checkDatasetState(
    datasetList: DatasetListDto[],
    jobType: string,
  ): Promise<void> {
    const datasetIds = datasetList.map((x) => x.pid);
    switch (jobType) {
      case JobType.Retrieve: // Intentional fall through
      case JobType.Archive:
        {
          const filter = {
            fields: {
              pid: true,
            },
            where: {
              [`datasetlifecycle.${DatasetState[jobType]}`]: false,
              pid: {
                $in: datasetIds,
              },
            },
          };
          const result = await this.datasetsService.findAll(filter);
          if (result.length > 0) {
            throw new HttpException(
              {
                status: HttpStatus.CONFLICT,
                message: `The following datasets are not in ${DatasetState[jobType]} state for a ${jobType} job.`,
                error: JSON.stringify(result.map(({ pid }) => ({ pid }))),
              },
              HttpStatus.CONFLICT,
            );
          }
        }
        break;
      case JobType.Public:
        {
          const filter = {
            fields: {
              pid: true,
            },
            where: {
              [DatasetState.public]: true,
              pid: {
                $in: datasetIds,
              },
            },
          };
          const result = await this.datasetsService.findAll(filter);
          if (result.length !== datasetIds.length) {
            throw new HttpException(
              {
                status: HttpStatus.CONFLICT,
                message: "The following datasets are not public.",
                error: JSON.stringify(result.map(({ pid }) => ({ pid }))),
              },
              HttpStatus.CONFLICT,
            );
          }
        }
        break;
      default:
        // Do not check for other job types
        break;
    }
  }

  /**
   * Check that the dataset files are valid
   */
  async checkDatasetFiles(
    datasetList: DatasetListDto[],
    jobType: string,
  ): Promise<void> {
    const datasetsToCheck = datasetList.filter(
      (x) => x.files.length > 0,
    );
    const ids = datasetsToCheck.map((x) => x.pid);

    switch (jobType) {
      case JobType.Public:
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
          await Promise.all(
            datasets.map(async (dataset) => {
              dataset.origdatablocks = await this.origDatablocksService.findAll(
                {
                  datasetId: dataset.pid,
                },
              );
            }),
          );
          const result: Record<string, Set<string>> = datasets.reduce(
            (acc: Record<string, Set<string>>, dataset) => {
              // Using Set make searching more efficient
              const files = dataset.origdatablocks.reduce((acc, block) => {
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
              const nonExistFiles = x.files.filter(
                (f) => !referenceFiles.has(f),
              );
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
                  }))
                ),
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }
        break;
      default:
        // Do not check for other job types
        break;
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
    const jobConfigs = configuration().jobConfiguration;
    const matchingConfig = jobConfigs.filter((j) => j.jobType == jobType);

    if (matchingConfig.length != 1) {
      if (matchingConfig.length > 1) {
        Logger.error(
          "More than one job configurations matching type " + jobType,
        );
      } else {
        Logger.error("No job configuration matching type " + jobType);
      }
      // return error that job type does not exists
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid job type: " + jobType,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return matchingConfig[0];
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
    jobInstance.contactEmail = jobCreateDto.contactEmail;
    jobInstance.jobParams = jobCreateDto.jobParams;
    jobInstance.datasetsValidation = false;
    jobInstance.configVersion =
      jobConfiguration[JobsConfigSchema.ConfigVersion];
    jobInstance.statusCode = "Initializing";
    jobInstance.statusMessage =
      "Building and validating job, verifying authorization";

    // validate datasetList, if it exists in jobParams
    let datasetList: DatasetListDto[] = [];
    if (JobParams.DatasetList in jobCreateDto.jobParams) {
      datasetList = await this.validateDatasetList(
        jobCreateDto.jobParams,
        jobCreateDto.type,
      );
      jobInstance.jobParams = {
        ...jobInstance.jobParams,
        [JobParams.DatasetList]: datasetList,
      };
    }
    if (user) {
      // the request comes from a user who is logged in.
      if (
        user.currentGroups.some((g) => configuration().adminGroups.includes(g))
      ) {
        // admin users
        let jobUser: JWTUser | null = user;
        if (user.username != jobCreateDto.ownerUser) {
          jobUser = await this.usersService.findByUsername2JWTUser(
            jobCreateDto.ownerUser,
          );
        }
        jobInstance.ownerUser = jobUser?.username as string;
        jobInstance.contactEmail = jobUser?.email as string;
        jobInstance.ownerGroup = jobCreateDto.ownerGroup;
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
        jobInstance.contactEmail = user.email;
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
      interface datasetsWhere {
        where: {
          pid: { $in: string[] };
          isPublished?: boolean;
          ownerGroup?: { $in: string[] };
          $or?: [
            { ownerGroup: { $in: string[] } },
            { accessGroups: { $in: string[] } },
            { isPublished: true },
          ];
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
        datasetsWhere["where"]["$or"] = [
          { ownerGroup: { $in: user.currentGroups } },
          { accessGroups: { $in: user.currentGroups } },
          { isPublished: true },
        ];
      } else if (jobConfiguration.create.auth === "#datasetOwner") {
        datasetsWhere["where"]["ownerGroup"] = { $in: user.currentGroups };
      }
      const numberOfDatasetsWithAccess =
        await this.datasetsService.count(datasetsWhere);
      const datasetsNoAccess =
        datasetIds.length - numberOfDatasetsWithAccess.count;
      jobInstance.datasetsValidation = datasetsNoAccess == 0;
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
      ability.can(Action.JobCreateAny, JobClass) ||
      ability.can(Action.JobCreateOwner, jobInstance) ||
      ability.can(Action.JobCreateConfiguration, jobInstance);

    if (!canCreate) {
      throw new ForbiddenException("Unauthorized to create this job.");
    }

    return jobInstance;
  }

  /**
   * Send off to external service
   */
  async performJobAction(
    jobInstance: JobClass,
    action: JobAction<CreateJobDto> | JobAction<StatusUpdateJobDto>,
  ): Promise<void> {
    await action.performJob(jobInstance).catch((err: Error) => {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Invalid job input. Job '${jobInstance.type}' unable to perfom 
            action '${action.getActionType()}' due to ${err}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  async performJobCreateAction(jobInstance: JobClass): Promise<void> {
    const jobConfig = this.getJobTypeConfiguration(jobInstance.type);
    for (const action of jobConfig.create.actions) {
      await this.performJobAction(jobInstance, action);
    }
    return;
  }

  async performJobStatusUpdateAction(jobInstance: JobClass): Promise<void> {
    const jobConfig = this.getJobTypeConfiguration(jobInstance.type);
    if (jobConfig.configVersion !== jobInstance.configVersion) {
      Logger.log(
        `
          Job was created with configVersion ${jobInstance.configVersion}.
          Current configVersion is ${jobConfig.configVersion}.
        `,
        "JobStatusUpdate",
      );
    }
    for (const action of jobConfig.statusUpdate.actions) {
      await this.performJobAction(jobInstance, action);
    }
    return;
  }

  /**
   * Create job
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobCreate, JobClass),
  )
  @Post()
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
  async create(
    @Req() request: Request,
    @Body() createJobDto: CreateJobDto,
  ): Promise<JobClass | null> {
    Logger.log("Creating job!");
    // Validate that request matches the current configuration
    // Check job authorization
    const jobInstance = await this.instanceAuthorizationJobCreate(
      createJobDto,
      request.user as JWTUser,
    );
    // Create actual job in database
    const createdJobInstance = await this.jobsService.create(jobInstance);
    // Perform the action that is specified in the create portion of the job configuration
    await this.performJobCreateAction(createdJobInstance);
    return createdJobInstance;
  }

  /**
   * Update job status
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobStatusUpdate, JobClass),
  )
  @Patch(":id")
  @ApiOperation({
    summary: "It updates the status of an existing job.",
    description: "It updates the status of an existing job.",
  })
  @ApiBody({
    description: "Status fields for the job to be updated",
    required: true,
    type: StatusUpdateJobDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobClass,
    description: "Updated job status",
  })
  async update(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() statusUpdateJobDto: StatusUpdateJobDto,
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
    const jobConfiguration = this.getJobTypeConfiguration(currentJob.type);
    const ability = this.caslAbilityFactory.jobsInstanceAccess(
      request.user as JWTUser,
      jobConfiguration,
    );
    // check if the user can update this job
    const canUpdateStatus =
      ability.can(Action.JobStatusUpdateAny, JobClass) ||
      ability.can(Action.JobStatusUpdateOwner, currentJobInstance) ||
      ability.can(Action.JobStatusUpdateConfiguration, currentJobInstance);
    if (!canUpdateStatus) {
      throw new ForbiddenException("Unauthorized to update this job.");
    }
    // Update job in database
    const updatedJob = await this.jobsService.statusUpdate(
      id,
      statusUpdateJobDto,
    );
    // Perform the action that is specified in the update portion of the job configuration
    if (updatedJob !== null) {
      await this.performJobStatusUpdateAction(updatedJob);
    }
    return updatedJob;
  }

  /**
   * Get fullquery
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get("/fullquery")
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
  async fullQuery(
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<JobClass[] | null> {
    try {
      const parsedFilters: IFilters<JobDocument, FilterQuery<JobDocument>> = {
        fields: JSON.parse(filters.fields ?? ("{}" as string)),
        limits: JSON.parse(filters.limits ?? ("{}" as string)),
      };
      const jobsFound = await this.jobsService.fullquery(parsedFilters);
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
      return jobsAccessible;
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
   * Get fullfacet
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get("/fullfacet")
  @ApiOperation({
    summary: "It returns a list of job facets matching the filter provided.",
    description:
      "It returns a list of job facets matching the filter provided.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Define the filter conditions by specifying the name of values of fields requested.",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "facets",
    description:
      "Define a list of field names, for which facet counts should be calculated.",
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [JobClass],
    description: "Return jobs requested.",
  })
  async fullFacet(
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    try {
      const fields: IJobFields = JSON.parse(filters.fields ?? ("{}" as string));
      const queryFilters: IFilters<JobDocument, FilterQuery<JobDocument>> = {
        fields: fields,
        limits: JSON.parse("{}" as string),
      };
      const jobsFound = await this.jobsService.fullquery(queryFilters);
      const jobIdsAccessible: string[] = [];

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
            jobIdsAccessible.push(jobsFound[i]._id);
          }
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
   * Get job by id
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get(":id")
  @ApiOperation({
    summary: "It returns the requested job.",
    description: "It returns the requested job.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobClass,
    description: "Found job",
  })
  async findOne(
    @Req() request: Request,
    @Param("id") id: string,
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
   * Get jobs
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobRead, JobClass),
  )
  @Get()
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
  async findAll(
    @Req() request: Request,
    @Query("filter") filter?: string,
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
      const jobsFound = await this.jobsService.findAll(parsedFilter);
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
      return jobsAccessible;
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
   * Delete a job
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobDelete, JobClass),
  )
  @Delete(":id")
  @ApiOperation({
    summary: "It deletes the requested job.",
    description: "It deletes the requested job.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: undefined,
    description: "Deleted job",
  })
  async remove(
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
