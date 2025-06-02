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
} from "@nestjs/common";
import { Request } from "express";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { CreateJobDtoV3 } from "./dto/create-job.v3.dto";
import { UpdateJobDtoV3 } from "./dto/update-job.v3.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { JobClass } from "./schemas/job.schema";
import { OutputJobV3Dto } from "./dto/output-job-v3.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Logger } from "@nestjs/common";
import { FullFacetResponse } from "src/common/types";
import {
  filterDescriptionSimplified,
  filterExampleSimplified,
  fullQueryDescriptionLimits,
  fullQueryExampleLimits,
  jobsFullQueryExampleFields,
  jobsFullQueryDescriptionFields,
} from "src/common/utils";
import { CreateJobV3MappingInterceptor } from "./interceptors/create-job-v3-mapping.interceptor";
import { UpdateJobV3MappingInterceptor } from "./interceptors/update-job-v3-mapping.interceptor";
import { JobsControllerUtils } from "./jobs.controller.utils";

@ApiBearerAuth()
@ApiTags("jobs")
@Controller({ path: "jobs", version: "3" })
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobsControllerUtils: JobsControllerUtils,
  ) {}

  /**
   * Create job v3
   */
  @UseGuards(PoliciesGuard)
  @CheckPolicies("jobs", (ability: AppAbility) =>
    ability.can(Action.JobCreate, JobClass),
  )
  @UseInterceptors(CreateJobV3MappingInterceptor)
  @Post()
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
  async create(
    @Req() request: Request,
    @Body() createJobDto: CreateJobDto,
  ): Promise<OutputJobV3Dto | null> {
    const job = await this.jobsControllerUtils.createJob(request, createJobDto);
    return job ? this.jobsControllerUtils.mapJobClassV4toV3(job) : null;
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
  async update(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<OutputJobV3Dto | null> {
    Logger.log("Updating job v3 ", id);
    const updatedJob = await this.jobsControllerUtils.updateJob(
      request,
      id,
      updateJobDto,
    );
    return updatedJob
      ? this.jobsControllerUtils.mapJobClassV4toV3(updatedJob)
      : null;
  }

  /**
   * Get fullquery v3
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
    type: [OutputJobV3Dto],
    description: "Return jobs requested.",
  })
  async fullQuery(
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<OutputJobV3Dto[] | null> {
    const jobs = await this.jobsControllerUtils.fullQueryJobs(request, filters);
    return jobs?.map(this.jobsControllerUtils.mapJobClassV4toV3) ?? null;
  }

  /**
   * Get fullfacet v3
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
  async fullFacet(
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    return this.jobsControllerUtils.fullFacetJobs(request, filters);
  }

  /**
   * Get job by id v3
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
  async findOne(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<OutputJobV3Dto | null> {
    const job = await this.jobsControllerUtils.getJobById(request, id);
    return job ? this.jobsControllerUtils.mapJobClassV4toV3(job) : null;
  }

  /**
   * Get jobs v3
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
    type: [OutputJobV3Dto],
    description: "Found jobs",
  })
  async findAll(
    @Req() request: Request,
    @Query("filter") filter?: string,
  ): Promise<OutputJobV3Dto[]> {
    const jobs = await this.jobsControllerUtils.getJobs(request, filter);
    return (
      jobs?.map(this.jobsControllerUtils.mapJobClassV4toV3) ??
      ([] as OutputJobV3Dto[])
    );
  }

  /**
   * Delete a job v3
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
