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
} from "@nestjs/common";
import { Request } from "express";
import { FilterQuery } from "mongoose";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobStatusDto } from "./dto/update-jobstatus.dto";
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
import { IFilters } from "src/common/interfaces/common.interface";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobsAuth } from "./types/jobs-auth.enum";
import { JobsConfigSchema } from "./types/jobs-config-schema.enum";
import configuration from "src/config/configuration";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { Logger } from "@nestjs/common";
import {
  filterDescriptionSimplified,
  filterExampleSimplified,
} from "src/common/utils";

@ApiBearerAuth()
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly datasetsService: DatasetsService,
    private readonly origDatablocksService: OrigDatablocksService,
    private eventEmitter: EventEmitter2,
  ) {}

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
  isFilterValid = (
    parsedFilterFields: string[]
  ): Boolean => {
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
   * Check that the job configuration is valid
   */
  async checkJobConfiguration (
    type: string
  ): Promise<Record<string, any>> {
    // it should return a single job configuration
    const jobConfigs = await configuration().jobConfiguration;
    const matchingConfig = jobConfigs.filter(
      (j) => j.jobType == type,
    );
    if (matchingConfig.length != 1) {
      // return error that job type does not exists
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid job type: " + type,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return matchingConfig[0];
  }


  /**
   * Check the job's configuration version
   */
  async checkConfigurationVersion(
    existingJob: JobClass,
  ): Promise<void> {
    const jc = await this.checkJobConfiguration(existingJob.type);
    if (jc.configVersion != existingJob.configVersion) {
      // return error that configuration version does not match
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid configuration version.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  /**
   * Check that the dataset ids list is valid
   */
  checkDatasetIds = (jobParams: Record<string, any> | undefined) => {
    if (!jobParams) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Dataset ids list was not provided in jobParams",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

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
   * Validate if the job is performable
   */
  async validateJob(
    createJobDto: CreateJobDto,
  ): Promise<string> {
    const jc = await this.checkJobConfiguration(createJobDto.type);

    await Promise.all(
      jc.create.actions.map((action: any) => {
        return action.validate(createJobDto).catch((err: any) => {
          if (err instanceof HttpException) {
            throw err;
          }
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: `Invalid job input. Action ${action.getActionType()} unable to validate ${
                createJobDto.type
              } job due to ${err}`,
            },
            HttpStatus.BAD_REQUEST,
          );
        });
      }),
    );
    return jc.configVersion;
  }


  /**
   * Checking if user is allowed to create job according to auth field of job configuration
   */
  async instanceAuthorization(
    createJobDto: CreateJobDto,
    user: JWTUser,
    functionType: string
  ): Promise<boolean> {
    const jc = await this.checkJobConfiguration(createJobDto.type);

    if (jc[functionType].auth == JobsAuth.All) {
      // Public, no token required
      // nothing to do here
      return true;
    } else if (jc[functionType].auth == JobsAuth.Admin) {
      // Verify that the user is an admin
      if (user !== null && user.currentGroups.includes('admin')) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return true;
    } else if (jc[functionType].auth == JobsAuth.Authenticated) {
      // Verify that the user is authenticated
      if (user === null) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return true;
    } else if (jc[functionType].auth == JobsAuth.DatasetPublic) {
      // verify that all the pids listed in the property indicated are public
      const datasetIds = this.checkDatasetIds(createJobDto.jobParams);
      const numberOfDatasets = await this.datasetsService.count({
        where: {
          pid: { $in: datasetIds },
          isPublished: true   
        },
      });

      const datasetsNoAccess = datasetIds.length - numberOfDatasets.count;

      if (datasetsNoAccess > 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message:
              "Unauthorized access to " +
              datasetsNoAccess +
              " datasets out of " +
              datasetIds.length,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return true;
    } else if (jc[functionType].auth == JobsAuth.DatasetOwner) {
      // verify that all the pids listed in the property indicated are owned by the user
      const datasetIds = this.checkDatasetIds(createJobDto.jobParams);
      const numberOfDatasets = await this.datasetsService.count({
        where: {
          pid: { $in: datasetIds },
          ownerGroup: { $in: user.currentGroups },
        },
      });
      const datasetsNotOwner = datasetIds.length - numberOfDatasets.count;

      if (datasetsNotOwner > 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message:
              "Unauthorized access to " +
              datasetsNotOwner +
              " datasets out of " +
              datasetIds.length,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (jc[functionType].auth == JobsAuth.DatasetAccess) {
      // verify that all the pids listed in the property indicated are accessible by the user
      const datasetIds = this.checkDatasetIds(createJobDto.jobParams);
      const numberOfDatasets = await this.datasetsService.count({
        where: {
          pid: { $in: datasetIds },
          $or: [
            { ownerGroup: { $in: user.currentGroups } },
            { accessGroups: { $in: user.currentGroups } },
            { isPublished: true }
          ]     
        },
      });

      const datasetsNoAccess = datasetIds.length - numberOfDatasets.count; // TBD

      if (datasetsNoAccess > 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message:
              "Unauthorized access to " +
              datasetsNoAccess +
              " datasets out of " +
              datasetIds.length,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return true;
    }

    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        message: "Incorrect jobParams."
      },
      HttpStatus.BAD_REQUEST,
    );
  }


  /**
   * Send off to external service, update job in database if needed
   */
  async performJobCreateAction(jobInstance: JobClass): Promise<void> {
    const jc = await this.checkJobConfiguration(jobInstance.type);
    for (var action of jc.create.actions) {
      await action.performJob(jobInstance).catch((err: any) => {
        if (err instanceof HttpException) {
          throw err;
        }
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: `Invalid job input. Action ${action.getActionType()} unable to validate ${
              jobInstance.type
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
    ability.can(AuthOp.JobsCreate, JobClass),
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
    const jobConfigVersion = await this.validateJob(createJobDto);
    // Check job authorization
    await this.instanceAuthorization(createJobDto, request.user as JWTUser, "create");
    // Create actual job in database
    const createdJobInstance = await this.jobsService.create(createJobDto, jobConfigVersion);
    // Perform the action that is specified in the create portion of the job configuration
    await this.performJobCreateAction(createdJobInstance);
    // Update job instance after the success of job create action
    return await this.jobsService.statusUpdate(
      createdJobInstance.id,
      { "jobStatusMessage": "Job has been created.", "jobStatusCode": "jobCreated" } as UpdateJobStatusDto
    );
  }


  /**
   * Update job status
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.JobsUpdate, JobClass),
  )
  @Patch(":id")
  @ApiOperation({
    summary: "It updates an existing job.",
    description: "It updates an existing job.",
  })
  @ApiBody({
    description: "Input fields for the job to be updated",
    required: true,
    type: UpdateJobStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: JobClass,
    description: "Updated job",
  })
  async update(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() statusUpdateJobDto: UpdateJobStatusDto,
  ): Promise<JobClass | null> {
    Logger.log("Updating job!");
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
    await this.instanceAuthorization(currentJob, request.user as JWTUser, "update");
    // Check configuration version
    await this.checkConfigurationVersion(currentJob);
    // Update job in database
    const updatedJob = await this.jobsService.statusUpdate(id, statusUpdateJobDto);
    // Emit update event
    if (updatedJob) {
      this.eventEmitter.emit("jobUpdated", {
        instance: updatedJob,
        hookState: { oldData: [updatedJob] },
      });
    }
    return updatedJob;
  }


  /**
   * Get job by id
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.JobsRead, JobClass),
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
    return this.jobsService.findOne({ _id: id });
  }


  /**
   * Get jobs
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.JobsRead, JobClass),
  )
  @Get()
  @ApiOperation({
    summary: "It returns a list of jobs.",
    description: "It returns a list of jobs. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description: "Filters to apply when retrieve all jobs\n" + filterDescriptionSimplified,
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
  ): Promise<JobClass[] | null> {
    const parsedFilter: IFilters<
      JobDocument,
      FilterQuery<JobDocument>
    > = JSON.parse(filter ?? "{}");

    if (!this.isFilterValid(Object.keys(parsedFilter))) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Invalid filter syntax.",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.jobsService.findAll(parsedFilter);
  }


  /** 
   * Delete a job
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AuthOp.Delete, JobClass),  // TBD
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
    return this.jobsService.remove({ _id: id });
  }
}
