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
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Job } from "./schemas/job.schema";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Job))
  @Post()
  create(@Body() createJobDto: CreateJobDto): Promise<Job> {
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
  findAll(@Query("filter") filter?: string): Promise<Job[]> {
    const parsedFilter = JSON.parse(filter ?? "{}");
    return this.jobsService.findAll(parsedFilter);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Job | null> {
    return this.jobsService.findOne({ _id: id });
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job | null> {
    return this.jobsService.update({ _id: id }, updateJobDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<unknown> {
    return this.jobsService.remove({ _id: id });
  }
}
