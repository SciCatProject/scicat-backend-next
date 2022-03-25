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

@ApiBearerAuth()
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Job))
  @Post()
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
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
