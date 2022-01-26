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
import { SamplesService } from "./samples.service";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Sample, SampleDocument } from "./schemas/sample.schema";
import { FilterQuery } from "mongoose";

@ApiBearerAuth()
@ApiTags("samples")
@Controller("samples")
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  // POST /samples
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Sample))
  @Post()
  async create(@Body() createSampleDto: CreateSampleDto): Promise<Sample> {
    return this.samplesService.create(createSampleDto);
  }

  // GET /samples
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get()
  async findAll(
    @Query() filters?: FilterQuery<SampleDocument>,
  ): Promise<Sample[]> {
    const sampleFilters = filters ?? {};
    return this.samplesService.findAll(sampleFilters);
  }

  // GET /samples/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get("/:id")
  async findOne(@Param("id") id: string): Promise<Sample | null> {
    return this.samplesService.findOne({ sampleId: id });
  }

  // PATCH /samples/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Sample))
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updateSampleDto: UpdateSampleDto,
  ): Promise<Sample | null> {
    return this.samplesService.update({ sampleId: id }, updateSampleDto);
  }

  // DELETE /samples/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Sample))
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.samplesService.remove({ sampleId: id });
  }
}
