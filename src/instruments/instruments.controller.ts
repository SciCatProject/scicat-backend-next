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
import { InstrumentsService } from "./instruments.service";
import { CreateInstrumentDto } from "./dto/create-instrument.dto";
import { UpdateInstrumentDto } from "./dto/update-instrument.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Instrument } from "./schemas/instrument.schema";
import { IInstrumentFilters } from "./interfaces/instrument-filters.interface";

@ApiBearerAuth()
@ApiTags("instruments")
@Controller("instruments")
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Instrument),
  )
  @Post()
  async create(
    @Body() createInstrumentDto: CreateInstrumentDto,
  ): Promise<Instrument> {
    return this.instrumentsService.create(createInstrumentDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Instrument))
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all instruments",
    required: false,
  })
  async findAll(@Query("filter") filter?: string): Promise<Instrument[]> {
    const instrumentFilter: IInstrumentFilters = JSON.parse(filter ?? "{}");
    return this.instrumentsService.findAll(instrumentFilter);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Instrument))
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Instrument | null> {
    return this.instrumentsService.findOne({ id });
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Instrument),
  )
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateInstrumentDto: UpdateInstrumentDto,
  ): Promise<Instrument | null> {
    return this.instrumentsService.update({ id }, updateInstrumentDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Instrument),
  )
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.instrumentsService.remove({ id });
  }
}
