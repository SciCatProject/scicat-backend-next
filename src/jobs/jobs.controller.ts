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
  UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import { FilterQuery } from "mongoose";
import { JobsService } from "./jobs.service";
import { CreateJobDto, CreateJobDtoWithConfig } from "./dto/create-job.dto";
import { StatusUpdateJobDto } from "./dto/status-update-job.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AuthOp } from "src/casl/authop.enum";
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
import { IFilters } from "src/common/interfaces/common.interface";
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
} from "src/common/utils";
import { JobCreateInterceptor } from "./interceptors/job-create.interceptor";
import { JobAction } from "./config/jobconfig";

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

  // /**
  //  * Check that all dataset exists
  //  * @param {List of dataset id} ids
  //  */
  // async checkDatasetsExistence(ids: string[]) {
  //   if (ids.length === 0) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         message: "Empty list of datasets - no Job sent",
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const filter = {
  //     fields: {
  //       pid: true,
  //     },
  //     where: {
  //       pid: {
  //         $in: ids,
  //       },
  //     },
  //   };

  //   const datasets = await this.datasetsService.findAll(filter);
  //   if (datasets.length != ids.length) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         message:
  //           "At least one of the datasets could not be found - no Job sent",
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // /**
  //  * Check that datasets is in state which the job can be performed
  //  * For retrieve jobs all datasets must be in state retrievable
  //  * For archive jobs all datasets must be in state archivable
  //  *      * For copy jobs no need to check only need to filter out datasets that have already been copied when submitting to job queue
  //  * ownerGroup is tested implicitly via Ownable
  //  */
  // async checkDatasetsState(type: string, ids: string[]) {
  //   switch (type) {
  //     case JobType.Retrieve: //Intentional fall through
  //     case JobType.Archive:
  //       {
  //         const filter = {
  //           fields: {
  //             pid: true,
  //           },
  //           where: {
  //             [`datasetlifecycle.${DatasetState[type]}`]: false,
  //             pid: {
  //               $in: ids,
  //             },
  //           },
  //         };
  //         const result = await this.datasetsService.findAll(filter);
  //         if (result.length > 0) {
  //           throw new HttpException(
  //             {
  //               status: HttpStatus.CONFLICT,
  //               message: `The following datasets are not in ${DatasetState[type]} state - no ${type} job sent:\n`,
  //               error: JSON.stringify(result),
  //             },
  //             HttpStatus.CONFLICT,
  //           );
  //         }
  //       }
  //       break;
  //     case JobType.Public:
  //       {
  //         const filter = {
  //           fields: {
  //             pid: true,
  //           },
  //           where: {
  //             [DatasetState.public]: true,
  //             pid: {
  //               $in: ids,
  //             },
  //           },
  //         };
  //         const result = await this.datasetsService.findAll(filter);
  //         if (result.length !== ids.length) {
  //           throw new HttpException(
  //             {
  //               status: HttpStatus.CONFLICT,
  //               message: "The following datasets are not public - no job sent",
  //               error: JSON.stringify(result),
  //             },
  //             HttpStatus.CONFLICT,
  //           );
  //         }
  //       }
  //       break;
  //     default:
  //       //Not check other job types
  //       break;
  //   }
  // }

  // async checkFilesExistence(crateJobDto: CreateJobDto) {
  //   const datasetsToCheck = crateJobDto.datasetList.filter(
  //     (x) => x.files.length > 0,
  //   );
  //   const ids = datasetsToCheck.map((x) => x.pid);
  //   switch (crateJobDto.type) {
  //     case JobType.Public:
  //       if (ids.length > 0) {
  //         const filter = {
  //           fields: {
  //             pid: true,
  //             datasetId: true,
  //             dataFileList: true,
  //           },
  //           where: {
  //             pid: {
  //               $in: ids,
  //             },
  //           },
  //         };
  //         // Indexing originDataBlock with pid and create set of files for each dataset
  //         const datasets = await this.datasetsService.findAll(filter);
  //         // Include origdatablocks
  //         await Promise.all(
  //           datasets.map(async (dataset) => {
  //             dataset.origdatablocks = await this.origDatablocksService.findAll(
  //               {
  //                 datasetId: dataset.pid,
  //               },
  //             );
  //           }),
  //         );
  //         const result: Record<string, Set<string>> = datasets.reduce(
  //           (acc: Record<string, Set<string>>, dataset) => {
  //             // Using Set make searching more efficient
  //             const files = dataset.origdatablocks.reduce((acc, block) => {
  //               block.dataFileList.forEach((file) => {
  //                 acc.add(file.path);
  //               });
  //               return acc;
  //             }, new Set<string>());
  //             acc[dataset.pid] = files;
  //             return acc;
  //           },
  //           {},
  //         );
  //         // Get a list of requested files that is not in originDataBlocks
  //         const checkResults = datasetsToCheck.reduce(
  //           (acc: { pid: string; nonExistFiles: string[] }[], x) => {
  //             const pid = x.pid;
  //             const referenceFiles = result[pid];
  //             const nonExistFiles = x.files.filter(
  //               (f) => !referenceFiles.has(f),
  //             );
  //             if (nonExistFiles.length > 0) {
  //               acc.push({ pid, nonExistFiles });
  //             }
  //             return acc;
  //           },
  //           [],
  //         );

  //         if (checkResults.length > 0) {
  //           throw new HttpException(
  //             {
  //               status: HttpStatus.BAD_REQUEST,
  //               message:
  //                 "At least one requested file could not be found - no job created",
  //             },
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }
  //       }
  //       break;
  //     default:
  //       // Not check for other job
  //       break;
  //   }
  // }

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
   * Check that the dataset ids list is valid
   */
  async checkDatasetIds(jobParams: Record<string, unknown>): Promise<string[]> {
    const field = JobsConfigSchema.DatasetIds;
    const datasetIds = (
      typeof jobParams[field] === "string"
        ? Array(jobParams[field])
        : jobParams[field]
    ) as Array<string>;

    if (!Array.isArray(datasetIds)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid dataset ids list",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (datasetIds.length == 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "List of passed dataset IDs is empty.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    interface condition {
      where: {
        pid: { $in: string[] };
      };
    }
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
          message: `Datasets with pid ${nonExistIds} don't exist.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return datasetIds;
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
    jobInstance.configuration = jobConfiguration;
    jobInstance.statusCode = "Initializing";
    jobInstance.statusMessage =
      "Building and validating job, verifying authorization";

    // if datasetIds property in jobParams is passed, check if such IDs exist in data base
    let datasetIds: string[] = [];
    if (JobsConfigSchema.DatasetIds in jobCreateDto.jobParams) {
      datasetIds = await this.checkDatasetIds(jobCreateDto.jobParams);
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
      if (!jobCreateDto.jobParams) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Dataset ids list was not provided in jobParams",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // verify that the user meet the requested permissions on the datasets listed
      // const datasetIds = await this.checkDatasetIds(jobCreateDto.jobParams);
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
    const ability = this.caslAbilityFactory.createForUser(user);
    // check if the user can create this job
    const canCreate =
      ability.can(AuthOp.JobCreateAny, JobClass) ||
      ability.can(AuthOp.JobCreateOwner, jobInstance) ||
      ability.can(AuthOp.JobCreateConfiguration, jobInstance);

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
          message: `Invalid job input. Action ${action.getActionType()} unable to perform ${
            jobInstance.type
          } job ${action.getActionType()} action due to ${err}`,
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

    // TODO - what shall we do when configVersion does not match?
    if (jobConfig.configVersion !== jobInstance.configuration.configVersion) {
      Logger.log(
        `
          Job was created with configVersion ${jobInstance.configuration.configVersion}.
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
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.JobCreate, JobClass),
  )
  // @UseInterceptors(JobCreateInterceptor)
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
    // throw an error if no jobParams are passed
    if (
      !createJobDto.jobParams ||
      Object.keys(createJobDto.jobParams).length == 0
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Job parameters need to be defined.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.JobStatusUpdate, JobClass),
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
    currentJobInstance.configuration = this.getJobTypeConfiguration(
      currentJobInstance.type,
    );

    const ability = this.caslAbilityFactory.createForUser(
      request.user as JWTUser,
    );
    // check if he/she can create this dataset
    const canUpdateStatus =
      ability.can(AuthOp.JobStatusUpdateAny, JobClass) ||
      ability.can(AuthOp.JobStatusUpdateOwner, currentJobInstance) ||
      ability.can(AuthOp.JobStatusUpdateConfiguration, currentJobInstance);
    if (!canUpdateStatus) {
      throw new ForbiddenException("Unauthorized to update this dataset");
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

    // Emit update event
    // MN: not needed
    // if (updatedJob) {
    //   this.eventEmitter.emit("jobUpdated", {
    //     instance: updatedJob,
    //     hookState: { oldData: [updatedJob] },
    //   });
    // }
    return updatedJob;
  }

  /**
   * Get job by id
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(AuthOp.JobRead, JobClass))
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
    const ability = this.caslAbilityFactory.createForUser(
      request.user as JWTUser,
    );
    const canCreate =
      ability.can(AuthOp.JobReadAny, JobClass) ||
      ability.can(AuthOp.JobReadAccess, currentJobInstance);
    if (!canCreate) {
      throw new ForbiddenException("Unauthorized to update this dataset");
    }
    return currentJob;
  }

  /**
   * Get jobs
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(AuthOp.JobRead, JobClass))
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
      const datasetsFound = await this.jobsService.findAll(parsedFilter);
      const datasetsAccessible: JobClass[] = [];
      const ability = this.caslAbilityFactory.createForUser(
        request.user as JWTUser,
      );

      for (const i in datasetsFound) {
        // check if he/she can create this dataset
        const jobInstance = await this.generateJobInstanceForPermissions(
          datasetsFound[i],
        );
        const canCreate =
          ability.can(AuthOp.JobReadAny, JobClass) ||
          ability.can(AuthOp.JobReadAccess, jobInstance);
        if (canCreate) {
          datasetsAccessible.push(datasetsFound[i]);
        }
      }
      return datasetsAccessible;
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
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(AuthOp.JobDelete, JobClass) &&
      ability.can(AuthOp.JobDeleteAny, JobClass),
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
