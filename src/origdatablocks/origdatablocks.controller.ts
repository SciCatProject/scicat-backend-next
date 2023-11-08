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
  Req,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import { OrigDatablocksService } from "./origdatablocks.service";
import { CreateOrigDatablockDto } from "./dto/create-origdatablock.dto";
import { UpdateOrigDatablockDto } from "./dto/update-origdatablock.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
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
import { PartialUpdateDatasetDto } from "src/datasets/dto/update-dataset.dto";
import { filterDescription, filterExample } from "src/common/utils";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";

@ApiBearerAuth()
@ApiTags("origdatablocks")
@Controller("origdatablocks")
export class OrigDatablocksController {
  constructor(
    private readonly origDatablocksService: OrigDatablocksService,
    private readonly datasetsService: DatasetsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async checkPermissionsForOrigDatablock(request: Request, id: string) {
    const origDatablock = await this.origDatablocksService.findOne({ _id: id });
    if (!origDatablock) {
      throw new BadRequestException("Invalid origDatablock Id");
    }

    return await this.checkPermissionsForDataset(
      request,
      origDatablock.datasetId,
    );
  }

  async checkPermissionsForDataset(request: Request, id: string) {
    const user: JWTUser = request.user as JWTUser;
    const dataset = await this.datasetsService.findOne({
      where: { pid: id },
    });
    if (dataset) {
      // NOTE: We need DatasetClass instance because casl module
      // can not recognize the type from dataset mongo database model.
      // If other fields are needed can be added later.
      const newDatasetClass = new DatasetClass();
      newDatasetClass.ownerGroup = dataset.ownerGroup;

      if (user) {
        const ability = this.caslAbilityFactory.createForUser(user);
        const canUpdate = ability.can(Action.Update, newDatasetClass);
        if (!canUpdate) {
          throw new ForbiddenException("Unauthorized access");
        }
      }
    } else {
      throw new BadRequestException("Invalid datasetId");
    }
    return dataset;
  }

  // POST /origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, OrigDatablock),
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({
    summary: "It creates a new orig datablock for the specified dataset.",
    description:
      "It creates a new orig datablock for the specified dataset. It contains the list of files associated with the datasets. Each dataset can have more than one orig datablocks",
  })
  @ApiBody({
    description: "Input fields for the orig datablock to be created",
    required: true,
    type: CreateOrigDatablockDto,
  })
  @ApiResponse({
    status: 201,
    type: OrigDatablock,
    description:
      "Create a new origdataset and return its representation in SciCat",
  })
  async create(
    @Req() request: Request,
    @Body() createOrigDatablockDto: CreateOrigDatablockDto,
  ): Promise<OrigDatablock> {
    const dataset = await this.checkPermissionsForDataset(
      request,
      createOrigDatablockDto.datasetId,
    );

    createOrigDatablockDto = {
      ...createOrigDatablockDto,
      ownerGroup: createOrigDatablockDto.ownerGroup
        ? createOrigDatablockDto.ownerGroup
        : dataset.ownerGroup,
      accessGroups: createOrigDatablockDto.accessGroups
        ? createOrigDatablockDto.accessGroups
        : JSON.parse(JSON.stringify(dataset.accessGroups)),
      instrumentGroup: createOrigDatablockDto.instrumentGroup
        ? createOrigDatablockDto.instrumentGroup
        : dataset.instrumentGroup,
    };

    const origdatablock = await this.origDatablocksService.create(
      createOrigDatablockDto,
    );

    await this.updateDatasetSizeAndFiles(dataset.pid);

    return origdatablock;
  }

  async updateDatasetSizeAndFiles(pid: string) {
    // updates datasets size
    const parsedFilters: IFilters<OrigDatablockDocument, IOrigDatablockFields> =
      { where: { datasetId: pid } };
    const datasetOrigdatablocks =
      await this.origDatablocksService.findAll(parsedFilters);

    const updateDatasetDto: PartialUpdateDatasetDto = {
      size: datasetOrigdatablocks
        .map((od) => od.size)
        .reduce((ps, a) => ps + a, 0),
      numberOfFiles: datasetOrigdatablocks
        .map((od) => od.dataFileList.length)
        .reduce((ps, a) => ps + a, 0),
    };

    await this.datasetsService.findByIdAndUpdate(pid, updateDatasetDto);
  }

  @AllowAny()
  @HttpCode(HttpStatus.OK)
  @Post("/isValid")
  @ApiOperation({
    summary: "It validates the orig datablock provided as input.",
    description:
      "It validates the orig datablock provided as input, and returns true if the information is a valid dataset",
  })
  @ApiBody({
    description:
      "Input fields for the orig datablock that needs to be validated",
    required: true,
    type: OrigDatablock,
  })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description:
      "Check if the orig datablock provided pass validation. It return true if the validation is passed",
  })
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
  @ApiOperation({
    summary: "It returns a list of orig datablocks.",
    description:
      "It returns a list of orig datablocks. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving all origdatablocks\n" +
      filterDescription,
    required: false,
    type: String,
    example: filterExample,
  })
  @ApiResponse({
    status: 200,
    type: OrigDatablock,
    isArray: true,
    description: "Return the orig datablocks requested",
  })
  async findAll(
    @Req() request: Request,
    @Query("filter") filter?: string,
  ): Promise<OrigDatablock[]> {
    const user: JWTUser = request.user as JWTUser;
    const parsedFilters: IFilters<OrigDatablockDocument, IOrigDatablockFields> =
      JSON.parse(filter ?? "{}");
    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, OrigDatablock);

      if (!canViewAll) {
        parsedFilters.where = parsedFilters.where ?? {};
        parsedFilters.where.userGroups = parsedFilters.where.userGroups ?? [];
        parsedFilters.where.userGroups.push(...user.currentGroups);
      }
    }

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
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<OrigDatablock[] | null> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IOrigDatablockFields = JSON.parse(filters.fields ?? "{}");

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, OrigDatablock);

      if (!canViewAll) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }

    const parsedFilters = {
      fields: fields,
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
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<OrigDatablock[] | null> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IOrigDatablockFields = JSON.parse(filters.fields ?? "{}");

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.Manage, OrigDatablock);

      if (!canViewAll) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }
    const parsedFilters = {
      fields: fields,
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
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IOrigDatablockFields = JSON.parse(filters.fields ?? "{}");

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, OrigDatablock);

      if (!canViewAll) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }
    const parsedFilters = {
      fields: fields,
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
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IOrigDatablockFields = JSON.parse(filters.fields ?? "{}");

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, OrigDatablock);

      if (!canViewAll) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }
    const parsedFilters = {
      fields: fields,
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
  @ApiOperation({
    summary: "It retrieve the origdatablock.",
    description: "It retrieve the original datablock with the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the origdatablock to be retrieved",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "The origdatablock requested",
    type: OrigDatablock,
  })
  async findById(
    @Req() request: Request,
    @Param("id")
    id: string,
  ): Promise<OrigDatablock | null> {
    const user = request.user as JWTUser;
    const filter = {
      _id: id,
      userGroups: [] as string[],
    };
    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, OrigDatablock);

      if (!canViewAll) {
        filter.userGroups.push(...user.currentGroups);
      }
    }

    try {
      const data = await this.origDatablocksService.findOne(filter);
      return data;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw new NotFoundException(error);
    }
  }

  // PATCH /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, OrigDatablock),
  )
  @Patch("/:id")
  @ApiOperation({
    summary: "It updates the origdatablock.",
    description: "It updates the original datablock with the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the origdatablock to be updated",
    type: String,
  })
  @ApiBody({
    description:
      "OrigDatablock object that needs to be updated. Only the origdatablock object fields that needs to be updated, should be passed in.",
    required: true,
    type: UpdateOrigDatablockDto,
  })
  @ApiResponse({
    status: 200,
    description: "The updated origdatablock",
    type: OrigDatablock,
  })
  async update(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() updateOrigDatablockDto: UpdateOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    await this.checkPermissionsForOrigDatablock(request, id);

    const origdatablock = (await this.origDatablocksService.update(
      { _id: id },
      updateOrigDatablockDto,
    )) as OrigDatablock;

    await this.updateDatasetSizeAndFiles(origdatablock.datasetId);

    return origdatablock;
  }

  // DELETE /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, OrigDatablock),
  )
  @Delete("/:id")
  @ApiOperation({
    summary: "It deletes the origdatablock.",
    description:
      "It delete the original datablock specified through the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the origdatablock to be deleted",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned",
  })
  async remove(@Param("id") id: string): Promise<unknown> {
    const origdatablock = (await this.origDatablocksService.remove({
      _id: id,
    })) as OrigDatablock;

    await this.updateDatasetSizeAndFiles(origdatablock.datasetId);

    return origdatablock;
  }
}
