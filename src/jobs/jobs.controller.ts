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
  UseInterceptors,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Job, JobDocument } from "./schemas/job.schema";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { SetCreatedUpdatedAtInterceptor } from "src/common/interceptors/set-created-updated-at.interceptor";
import { DatasetsService } from "src/datasets/datasets.service";

@ApiBearerAuth()
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly datasetsService: DatasetsService,
  ) {}

  /**
   * Check that all dataset exists
   * @param {List of dataset id} ids
   */
  async checkDatasetsExistence(ids: string[]) {
    const e = new Error();
    // e.statusCode = 404;
    if (ids.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Empty list of datasets - no Job sent",
        },
        HttpStatus.BAD_REQUEST,
      );

      throw e;
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
   * Validate if the job is performable
   */
  async validateJob(createJobDto: CreateJobDto) {
    const ids = createJobDto.datasetList.map((x) => x.pid);
    // checkPermission(ctx, ids);
    await this.checkDatasetsExistence(ids);
    // await checkDatasetsState(ctx, ids);
    // await checkFilesExistence(ctx, ids);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Job))
  @UseInterceptors(new SetCreatedUpdatedAtInterceptor<Job>("creationTime"))
  @Post()
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    await this.validateJob(createJobDto);

    return this.jobsService.create(createJobDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Job))
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all jobs",
    required: false,
  })
  async findAll(@Query("filter") filter?: string): Promise<Job[]> {
    const parsedFilter: IFilters<
      JobDocument,
      FilterQuery<JobDocument>
    > = JSON.parse(filter ?? "{}");
    return this.jobsService.findAll(parsedFilter);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Job))
  @Get("/fullquery")
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<Job[]> {
    const parsedFilters: IFilters<JobDocument, FilterQuery<JobDocument>> = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.jobsService.fullquery(parsedFilters);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Job))
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Job))
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Job | null> {
    return this.jobsService.findOne({ _id: id });
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Job))
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job | null> {
    return this.jobsService.update({ _id: id }, updateJobDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Job))
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.jobsService.remove({ _id: id });
  }
}
