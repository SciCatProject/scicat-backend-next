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
import { UpdateJobStatusDto, UpdateStatusJobDto } from "./dto/status-update-job.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { AuthOp } from "src/casl/authop.enum";
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
import { JobsAuth } from "./types/jobs-auth.enum";
import { JobsConfigSchema } from "./types/jobs-config-schema.enum";
import configuration from "src/config/configuration";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { Logger } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { UserProfile } from "src/users/schemas/user-profile.schema";

@ApiBearerAuth()
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  jobDatasetAuthorization: Array<string> = [];
  caslAbilityFactory: any;

  constructor(
    private readonly jobsService: JobsService,
    private readonly datasetsService: DatasetsService,
    private readonly origDatablocksService: OrigDatablocksService,
    private readonly usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {
    this.jobDatasetAuthorization = Object.values(AuthOp).filter((v) => v.includes("#dataset"));
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
   * Check that the dataset ids list is valid
   */
  checkDatasetIds = (jobParams: Record<string, any>) => {
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
    return datasetIds;
  }


  /**
   * Validate if the job has a matching configuration and is performable
   */
  async validateJob(
    createJobDto: CreateJobDto,
  ): Promise<any> {
    // it should return a single job configuration
    const jobConfigs = await configuration().jobConfiguration;
    const matchingConfig = jobConfigs.filter(
      (j) => j.jobType == createJobDto.type,
    );
    if (matchingConfig.length != 1) {
      if (matchingConfig.length > 1) {
        Logger.error("More than one job configurations matching type " + createJobDto.type);
      } else if () {
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
        return action.validate(createJobDto).catch((err) => {
          Logger.error(err);
          if (err instanceof HttpException) {
            throw err;
          }
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: `Invalid job input. Action ${action.getActionType()} unable to validate ${createJobDto.type
                } job due to ${err}`,
            },
            HttpStatus.BAD_REQUEST,
          );
        });
      }),
    );

    return jc;
  }

  /**
   * Checking if user is allowed to create job according to auth field of job configuration
   */
  async instanceAuthorizationJobCreate(
    jobCreateDto: Record<string, any>,
    user: JWTUser,
    jobConfiguration: any
  ): Promise<JobClass> {


    // NOTE: We need JobClass instance because casl module works only on that. 
    // If other fields are needed can be added later.
    const jobInstance = new JobClass();
    jobInstance._id = "";
    jobInstance.ownerUser = "";
    jobInstance.ownerGroup = "";
    jobInstance.accessGroups = [];
    jobInstance.requesterEmail = jobCreateDto.requesterEmail;
    jobInstance.datasetsValidation = false;
    jobInstance.configuration = jobConfiguration;
    jobInstance.statusCode = "Initializing";
    jobInstance.statusMessage = "Building and validating job, verifying authorization";

    if (user) {
      // the request comes from a user who is logged in.
      if (user.currentGroups.some((g) => configuration().adminGroups.includes(g))) {
        // admin users
        let jobUser: JWTUser | null = user;
        if (user.username != jobCreateDto.ownerUser) {
          jobUser = await this.usersService.findByUsername2JWTUser(jobCreateDto.ownerUser);
        }

        jobInstance.ownerUser = jobUser?.username as string;
        jobInstance.requesterEmail = jobUser?.email as string;
        jobInstance.ownerGroup = (
          jobCreateDto.ownerGroup
            ? jobCreateDto.ownerGroup
            : jobUser?.currentGroups[0]
        )
      } else {
        jobInstance.ownerUser = user.username;
        jobInstance.requesterEmail = user.email;
        jobInstance.ownerGroup = (
          user.currentGroups.includes(jobCreateDto.ownerGroup)
            ? jobCreateDto.ownerGroup
            : user.currentGroups[0]
        )
      }
    }

    if (jobConfiguration.create.auth in this.jobDatasetAuthorization) {
      // verify that the user meet the requested permissions on the datasets listed
      const datasetIds = this.checkDatasetIds(jobCreateDto.jobParams);
      // build the condition
      let datasetsWhere: any = {
        where: {
          pid: { $in: datasetIds },
        }
      }
      if (jobConfiguration.create.auth = "#datasetPublic") {
        datasetsWhere['isPublished'] = true;
      } else if (jobConfiguration.create.auth = "#datasetAccess") {
        datasetsWhere['$or'] = [
          { ownerGroup: { $in: user.currentGroups } },
          { accessGroups: { $in: user.currentGroups } },
          { isPublished: true }
        ]
      } else if (jobConfiguration.create.auth = "#datasetOwner") {
        datasetsWhere['ownerGroup'] = { $in: user.currentGroups }
      }
      const numberOfDatasetsWithAccess = await this.datasetsService.count(datasetsWhere);
      const datasetsNoAccess = datasetIds.length - numberOfDatasetsWithAccess.count;
      jobInstance.datasetsValidation = (datasetsNoAccess == 0);
    }


    // instantiate the casl matrix for the user
    const ability = this.caslAbilityFactory.createForUser(user);
    // check if he/she can create this dataset
    const canCreate =
      ability.can(AuthOp.JobCreateAny, JobClass) ||
      ability.can(AuthOp.JobCreateOwner, jobInstance) ||
      ability.can(AuthOp.JobCreateConfiguration, jobInstance);

    if (!canCreate) {
      throw new ForbiddenException("Unauthorized to create this dataset");
    }

    return jobInstance;
  }


  /**
   * Send off to external service, update job in database if needed
   */
  async performJobCreateAction(jobInstance: JobClass): Promise<void> {
    for (var action of jobInstance.configuration?.create?.actions as Array<any>) {
      await action.performJob(jobInstance).catch((err: any) => {
        if (err instanceof HttpException) {
          throw err;
        }
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: `Invalid job input. Action ${action.getActionType()} unable to validate ${jobInstance.type
              } job due to ${err}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
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
  ): Promise<JobClass> {
    Logger.log("Creating job!");
    // Validate that request matches the current configuration
    const jobConfiguration = await this.validateJob(createJobDto);
    // Check job authorization
    const jobInstance = await this.instanceAuthorizationJobCreate(
      createJobDto,
      request.user as JWTUser,
      jobConfiguration
    );
    // Create actual job in database
    const createdJobInstance = await this.jobsService.create(jobInstance);
    // Perform the action that is specified in the create portion of the job configuration
    await this.performJobCreateAction(createdJobInstance);
    // TBD
    // Update job instance with results of job create action
    // return await this.jobsService.statusUpdate(createdJobInstance);
    return createdJobInstance;
  }


  /**
   * Checking if user is allowed to create job according to auth field of job configuration
   */
  async instanceAuthorizationJobStatusUpdate(
    jobStatusUpdateDto: UpdateStatusJobDto,
    user: JWTUser,
    jobInstance: JobClass
  ): Promise<JobClass> {

    // instantiate the casl matrix for the user
    const ability = this.caslAbilityFactory.createForUser(user);
    // check if he/she can create this dataset
    const canCreate =
      ability.can(AuthOp.JobStatusUpdateAny, JobClass) ||
      ability.can(AuthOp.JobStatusUpdateOwner, jobInstance) ||
      ability.can(AuthOp.JobStatusUpdateConfiguration, jobInstance);

    if (!canCreate) {
      throw new ForbiddenException("Unauthorized to update this dataset");
    }

    return jobInstance;
  }

  /**
   * Update job
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.JobStatusUpdate, JobClass),
  )
  @Patch(":id")
  @ApiOperation({
    summary: "It updates an existing job.",
    description: "It updates an existing job.",
  })
  @ApiBody({
    description: "Input fields for the job to be updated",
    required: true,
    type: UpdateStatusJobDto
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobClass,
    description: "Updated job",
  })
  async update(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() updateJobDto: UpdateStatusJobDto,
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
    // Check job authorization
    await this.instanceAuthorizationJobStatusUpdate(
      updateJobDto,
      request.user as JWTUser,
      currentJob
    );
    // Update job in database
    const updatedJob = await this.jobsService.statusUpdate(id, updateJobDto);
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
   * Find job by id
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.Read, JobClass),
  )
  @Get(":id")
  @ApiOperation({
    summary: "It finds an existing job based on its id.",
    description: "It finds an existing job based on its id.",
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
    return this.jobsService.findOne({ _id: id });
  }


  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(AuthOp.Read, JobClass))
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all jobs",
    required: false,
  })
  async findAll(@Query("filter") filter?: string): Promise<JobClass[]> {
    const parsedFilter: IFilters<
      JobDocument,
      FilterQuery<JobDocument>
    > = JSON.parse(filter ?? "{}");
    return this.jobsService.findAll(parsedFilter);
  }

  // @UseGuards(PoliciesGuard)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, JobClass))
  // @Get("/fullquery")
  // async fullquery(
  //   @Query() filters: { fields?: string; limits?: string },
  // ): Promise<JobClass[]> {
  //   const parsedFilters: IFilters<JobDocument, FilterQuery<JobDocument>> = {
  //     fields: JSON.parse(filters.fields ?? "{}"),
  //     limits: JSON.parse(filters.limits ?? "{}"),
  //   };
  //   return this.jobsService.fullquery(parsedFilters);
  // }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(AuthOp.Read, JobClass))
  @Get("/fullfacet")
  async fullfacet(
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const parsedFilters: IFacets<FilterQuery<JobDocument>> = {
      fields: JSON.parse(filters.fields ?? "{}"),
      facets: JSON.parse(filters.facets ?? "[]"),
    };
    return this.jobsService.fullfacet(parsedFilters);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(AuthOp.Delete, JobClass))
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.jobsService.remove({ _id: id });
  }
}
