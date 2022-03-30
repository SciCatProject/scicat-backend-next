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
} from "@nestjs/common";
import { InstrumentsService } from "./instruments.service";
import { CreateInstrumentDto } from "./dto/create-instrument.dto";
import { UpdateInstrumentDto } from "./dto/update-instrument.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Instrument, InstrumentDocument } from "./schemas/instrument.schema";
import { FormatPhysicalQuantitiesInterceptor } from "src/common/interceptors/format-physical-quantities.interceptor";
import { IFilters } from "src/common/interfaces/common.interface";

@ApiBearerAuth()
@ApiTags("instruments")
@Controller("instruments")
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Instrument),
  )
  @UseInterceptors(
    new FormatPhysicalQuantitiesInterceptor<Instrument>("customMetadata"),
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
    const instrumentFilter: IFilters<InstrumentDocument> = JSON.parse(
      filter ?? "{}",
    );
    return this.instrumentsService.findAll(instrumentFilter);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Instrument))
  @Get(":id")
  async findOne(@Param("id") pid: string): Promise<Instrument | null> {
    return this.instrumentsService.findOne({ pid });
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Instrument),
  )
  @UseInterceptors(
    new FormatPhysicalQuantitiesInterceptor<Instrument>("customMetadata"),
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
