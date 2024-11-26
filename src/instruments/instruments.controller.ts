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
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InstrumentsService } from "./instruments.service";
import { CreateInstrumentDto } from "./dto/create-instrument.dto";
import { PartialUpdateInstrumentDto } from "./dto/update-instrument.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Instrument, InstrumentDocument } from "./schemas/instrument.schema";
import { FormatPhysicalQuantitiesInterceptor } from "src/common/interceptors/format-physical-quantities.interceptor";
import { IFilters } from "src/common/interfaces/common.interface";
import {
  filterDescription,
  filterExample,
  replaceLikeOperator,
} from "src/common/utils";
import { DecodeURIPipe } from "src/common/pipes/decodeURI.pipe";

@ApiBearerAuth()
@ApiTags("instruments")
@Controller("instruments")
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies("instruments", (ability: AppAbility) =>
    ability.can(Action.InstrumentCreate, Instrument),
  )
  @UseInterceptors(
    new FormatPhysicalQuantitiesInterceptor<Instrument>("customMetadata"),
  )
  @Post()
  async create(
    @Body() createInstrumentDto: CreateInstrumentDto,
  ): Promise<Instrument> {
    try {
      const instrument =
        await this.instrumentsService.create(createInstrumentDto);
      return instrument;
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      // we'll proceed, but let's report it
      throw new HttpException(
        `Instrument with the same unique name already exists: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("instruments", (ability: AppAbility) =>
    ability.can(Action.InstrumentRead, Instrument),
  )
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all instruments",
    required: false,
  })
  async findAll(@Query("filter") filter?: string): Promise<Instrument[]> {
    const instrumentFilter: IFilters<InstrumentDocument> = replaceLikeOperator(
      JSON.parse(filter ?? "{}"),
    );
    return this.instrumentsService.findAll(instrumentFilter);
  }

  // GET /instrument/findOne
  @UseGuards(PoliciesGuard)
  @CheckPolicies("instruments", (ability: AppAbility) =>
    ability.can(Action.InstrumentRead, Instrument),
  )
  @Get("/findOne")
  @ApiOperation({
    summary: "It returns the first instrument found.",
    description:
      "It returns the first instrument of the ones that matches the filter provided. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving instruments\n" +
      filterDescription,
    required: false,
    type: String,
    example: filterExample,
  })
  @ApiResponse({
    status: 200,
    type: Instrument,
    description: "Return the instrument requested",
  })
  async findOne(@Query("filter") filter?: string): Promise<Instrument | null> {
    const instrumentFilters = replaceLikeOperator(JSON.parse(filter ?? "{}"));

    return this.instrumentsService.findOne(instrumentFilters);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("instruments", (ability: AppAbility) =>
    ability.can(Action.InstrumentRead, Instrument),
  )
  @Get(":id")
  async findById(
    @Param("id", DecodeURIPipe) pid: string,
  ): Promise<Instrument | null> {
    return this.instrumentsService.findOne({ where: { _id: pid } });
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("instruments", (ability: AppAbility) =>
    ability.can(Action.InstrumentUpdate, Instrument),
  )
  @UseInterceptors(
    new FormatPhysicalQuantitiesInterceptor<Instrument>("customMetadata"),
  )
  @Patch(":id")
  async update(
    @Param("id", DecodeURIPipe) id: string,
    @Body() updateInstrumentDto: PartialUpdateInstrumentDto,
  ): Promise<Instrument | null> {
    try {
      const instrument = await this.instrumentsService.update(
        { _id: id },
        updateInstrumentDto,
      );
      return instrument;
    } catch (e) {
      throw new HttpException(
        "Instrument with the same unique name already exists",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("instruments", (ability: AppAbility) =>
    ability.can(Action.InstrumentDelete, Instrument),
  )
  @Delete(":id")
  async remove(@Param("id", DecodeURIPipe) id: string): Promise<unknown> {
    return this.instrumentsService.remove({ pid: id });
  }
}
