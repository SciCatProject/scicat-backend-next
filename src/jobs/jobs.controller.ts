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
import { PartialUpdateJobDto } from "./dto/update-job.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { JobClass, JobDocument } from "./schemas/job.schema";
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobType, DatasetState } from "./job-type.enum";
import configuration from "src/config/configuration";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";

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

  /**
   * Check that all dataset exists
   * @param {List of dataset id} ids
   */
  async checkDatasetsExistence(ids: string[]) {
    if (ids.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Empty list of datasets - no Job sent",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const filter = {
      fields: {
        pid: true,
      },
      where: {
        pid: {
          $in: ids,
        },
      },
    };

    const datasets = await this.datasetsService.findAll(filter);
    if (datasets.length != ids.length) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message:
            "At least one of the datasets could not be found - no Job sent",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Check that datasets is in state which the job can be performed
   * For retrieve jobs all datasets must be in state retrievable
   * For archive jobs all datasets must be in state archivable
   *      * For copy jobs no need to check only need to filter out datasets that have already been copied when submitting to job queue
   * ownerGroup is tested implicitly via Ownable
   */
  async checkDatasetsState(type: string, ids: string[]) {
    switch (type) {
      case JobType.Retrieve: //Intentional fall through
      case JobType.Archive:
        {
          const filter = {
            fields: {
              pid: true,
            },
            where: {
              [`datasetlifecycle.${DatasetState[type]}`]: false,
              pid: {
                $in: ids,
              },
            },
          };
          const result = await this.datasetsService.findAll(filter);
          if (result.length > 0) {
            throw new HttpException(
              {
                status: HttpStatus.CONFLICT,
                message: `The following datasets are not in ${DatasetState[type]} state - no ${type} job sent:\n`,
                error: JSON.stringify(result),
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
                $in: ids,
              },
            },
          };
          const result = await this.datasetsService.findAll(filter);
          if (result.length !== ids.length) {
            throw new HttpException(
              {
                status: HttpStatus.CONFLICT,
                message: "The following datasets are not public - no job sent",
                error: JSON.stringify(result),
              },
              HttpStatus.CONFLICT,
            );
          }
        }
        break;
      default:
        //Not check other job types
        break;
    }
  }

  async checkFilesExistence(crateJobDto: CreateJobDto) {
    const datasetsToCheck = crateJobDto.datasetList.filter(
      (x) => x.files.length > 0,
    );
    const ids = datasetsToCheck.map((x) => x.pid);
    switch (crateJobDto.type) {
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
          // Get a list of requested files that is not in originDataBlocks
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
                message:
                  "At least one requested file could not be found - no job created",
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }
        break;
      default:
        // Not check for other job
        break;
    }
  }

  /**
   * Check the the user is authenticated when requesting other job types than public job
   */
  checkPermission = (request: Request, type: string) => {
    const unauthenticated = request.user === null;
    if (unauthenticated && type !== JobType.Public) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  };

  /**
   * Validate if the job is performable
   */
  async validateJob(createJobDto: CreateJobDto, request: Request) {
    const ids = createJobDto.datasetList.map((x) => x.pid);
    this.checkPermission(request, createJobDto.type);
    await this.checkDatasetsExistence(ids);
    await this.checkDatasetsState(createJobDto.type, ids);
    await this.checkFilesExistence(createJobDto);
  }

  @AllowAny()
  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: JobClass,
    description: "Created job",
  })
  async create(
    @Req() request: Request,
    @Body() createJobDto: CreateJobDto,
  ): Promise<JobClass> {
    const jobToCreate = { ...createJobDto, jobStatusMessage: "jobSubmitted" };
    await this.validateJob(jobToCreate, request);

    const createdJob = await this.jobsService.create(jobToCreate);

    if (createdJob) {
      // Emit event so facilities can trigger custom code
      this.publishJob();
      this.eventEmitter.emit("jobCreated", { instance: createdJob });
    }

    return createdJob;
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, JobClass))
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

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, JobClass))
  @Get("/fullquery")
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<JobClass[]> {
    const parsedFilters: IFilters<JobDocument, FilterQuery<JobDocument>> = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.jobsService.fullquery(parsedFilters);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, JobClass))
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, JobClass))
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<JobClass | null> {
    return this.jobsService.findOne({ _id: id });
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, JobClass))
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateJobDto: PartialUpdateJobDto,
  ): Promise<JobClass | null> {
    const updatedJob = await this.jobsService.update({ _id: id }, updateJobDto);

    if (updatedJob) {
      this.eventEmitter.emit("jobUpdated", {
        instance: updatedJob,
        hookState: { oldData: [updatedJob] },
      });
    }

    return updatedJob;
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, JobClass))
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.jobsService.remove({ _id: id });
  }
}
