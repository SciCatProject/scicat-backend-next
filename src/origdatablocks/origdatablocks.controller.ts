/* eslint-disable @typescript-eslint/quotes */
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
  BadRequestException,
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
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { DatasetsService } from "src/datasets/datasets.service";

@ApiBearerAuth()
@ApiTags("origdatablocks")
@Controller("origdatablocks")
export class OrigDatablocksController {
  constructor(
    private readonly origDatablocksService: OrigDatablocksService,
    private readonly datasetsService: DatasetsService,
  ) {}

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
    const dataset = await this.datasetsService.findOne({
      where: { pid: createOrigDatablockDto.datasetId },
    });
    if (!dataset) {
      throw new BadRequestException("Invalid datasetId");
    }
    return this.origDatablocksService.create(createOrigDatablockDto);
  }

  @AllowAny()
  @HttpCode(HttpStatus.OK)
  @Post("/isValid")
  async isValid(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() createOrigDatablock: unknown,
  ): Promise<{ valid: boolean; errors: ValidationError[] }> {
    const dtoTestOrigDatablock = plainToInstance(
      CreateOrigDatablockDto,
      createOrigDatablock,
    );
    const errorsTestOrigDatablock = await validate(dtoTestOrigDatablock);

    const valid = errorsTestOrigDatablock.length == 0;

    return { valid: valid, errors: errorsTestOrigDatablock };
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
    const parsedFilters: IFilters<OrigDatablockDocument, IOrigDatablockFields> =
      JSON.parse(filters ?? "{}");
    return this.origDatablocksService.findAll(parsedFilters);
  }

  // GET /origdatablocks/fullquery
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/fullquery")
  @ApiQuery({
    name: "fields",
    description:
      "Define the query conditions using mongoDB syntax as JSON object. It also supports the `text` search, if you want to look for strings anywhere in the originalDatablocks. Please refer to mongo documentation for more information about the syntax",
    required: false,
    type: String,
    example: {},
  })
  @ApiQuery({
    name: "limits",
    description: "Define further query parameters like skip, limit, order",
    required: false,
    type: String,
    example: '{ "skip": 0, "limit": 25, "order": "creationTime:desc" }',
  })
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<OrigDatablock[] | null> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };

    return this.origDatablocksService.fullquery(parsedFilters);
  }

  // GET /origdatablocks/fullquery/files
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/fullquery/files")
  @ApiQuery({
    name: "fields",
    description:
      "Define the query conditions using mongoDB syntax as JSON object. It also supports the `text` search, if you want to look for strings anywhere in the originalDatablocks. Please refer to mongo documentation for more information about the syntax",
    required: false,
    type: String,
    example: {},
  })
  @ApiQuery({
    name: "limits",
    description: "Define further query parameters like skip, limit, order",
    required: false,
    type: String,
    example: '{ "skip": 0, "limit": 25, "order": "creationTime:desc" }',
  })
  async fullqueryFiles(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<OrigDatablock[] | null> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };

    return this.origDatablocksService.fullqueryFilesList(parsedFilters);
  }

  //  GET /origdatablocks/fullfacet
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/fullfacet")
  async fullfacet(
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.facets ?? "{}"),
    };
    return this.origDatablocksService.fullfacet(parsedFilters);
  }

  //  GET /origdatablocks/fullfacet/files
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/fullfacet/files")
  async fullfacetFiles(
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const parsedFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.facets ?? "{}"),
    };
    const getSubFieldCount = "dataFileList";

    return this.origDatablocksService.fullfacet(
      parsedFilters,
      getSubFieldCount,
    );
  }

  // GET /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/:id")
  async findById(@Param("id") id: string): Promise<OrigDatablock | null> {
    return this.origDatablocksService.findOne({ _id: id });
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
      { _id: id },
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
    return this.origDatablocksService.remove({ _id: id });
  }
}
