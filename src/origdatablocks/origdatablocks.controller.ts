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
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OrigDatablocksService } from "./origdatablocks.service";
import { CreateOrigDatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigDatablockDto } from "./dto/update-origdatablock.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import {
  OrigDatablock,
  OrigDatablockDocument,
} from "./schemas/origdatablock.schema";
import { IFilters } from "src/common/interfaces/common.interface";
import { IOrigDatablockFields } from "./interfaces/origdatablocks.interface";

@ApiBearerAuth()
@ApiTags("origdatablocks")
@Controller("origdatablocks")
export class OrigDatablocksController {
  constructor(private readonly origDatablocksService: OrigDatablocksService) {}

  // POST /origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, OrigDatablock),
  )
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(
    @Body() createOrigDatablockDto: CreateOrigDatablockDto,
  ): Promise<OrigDatablock> {
    return this.origDatablocksService.create(createOrigDatablockDto);
  }

  // GET /origdatablock
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get()
  @ApiQuery({
    name: "filters",
    description: "Database filters to apply when retrieve all origdatablocks",
    required: false,
  })
  async findAll(@Query("filters") filters?: string): Promise<OrigDatablock[]> {
    const sampleFilters: IFilters<OrigDatablockDocument, IOrigDatablockFields> =
      JSON.parse(filters ?? "{}");
    return this.origDatablocksService.findAll(sampleFilters);
  }

  // GET /origdatablocks/fullquery
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/fullquery")
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<OrigDatablock[]> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.origDatablocksService.fullquery(parsedFilters);
  }

  // GET /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/:id")
  async findById(@Param("id") id: string): Promise<OrigDatablock | null> {
    return this.origDatablocksService.findOne({ sampleId: id });
  }

  // PATCH /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, OrigDatablock),
  )
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updateOrigDatablockDto: UpdateOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    return this.origDatablocksService.update(
      { sampleId: id },
      updateOrigDatablockDto,
    );
  }

  // DELETE /origdatablocks/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, OrigDatablock),
  )
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.origDatablocksService.remove({ sampleId: id });
  }
}
