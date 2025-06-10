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
  Req,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import { OrigDatablocksService } from "./origdatablocks.service";
import { CreateOrigDatablockDto } from "./dto/create-origdatablock.dto";
import { PartialUpdateOrigDatablockDto } from "./dto/update-origdatablock.dto";
import { OutputOrigDatablockDto, PartialOutputOrigDatablockDto } from "./dto/output-origdatablock.dto";
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
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import {
  IOrigDatablockFields,
  IOrigDatablockFiltersV4,
} from "./interfaces/origdatablocks.interface";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { DatasetsService } from "src/datasets/datasets.service";
import { PartialUpdateDatasetDto } from "src/datasets/dto/update-dataset.dto";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { CreateRawDatasetObsoleteDto } from "src/datasets/dto/create-raw-dataset-obsolete.dto";
import { CreateDerivedDatasetObsoleteDto } from "src/datasets/dto/create-derived-dataset-obsolete.dto";
import {
  IsValidResponse,
  FullFacetFilters,
  FullFacetResponse,
} from "src/common/types";
import { getSwaggerOrigDatablockFilterContent } from "./origdatablock-filter-content";
import { OrigDatablockLookupKeysEnum } from "./origdatablock-lookup";
import { IncludeValidationPipe } from "./pipes/include-validation.pipe";
import { FilterValidationPipe } from "./pipes/filter-validation.pipe";

@ApiBearerAuth()
@ApiTags("origdatablocks v4")
@Controller({ path: "origdatablocks", version: "4" })
export class OrigDatablocksV4Controller {
  constructor(
    private readonly origDatablocksService: OrigDatablocksService,
    private readonly datasetsService: DatasetsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async generateOrigDatablockInstanceInstanceForPermissions(
    dataset:
      | CreateRawDatasetObsoleteDto
      | CreateDerivedDatasetObsoleteDto
      | DatasetClass,
  ): Promise<OrigDatablock> {
    const origDatablockInstance = new OrigDatablock();
    origDatablockInstance.datasetId = dataset.pid || "";
    origDatablockInstance.accessGroups = dataset.accessGroups || [];
    origDatablockInstance.ownerGroup = dataset.ownerGroup;
    origDatablockInstance.isPublished = dataset.isPublished || false;
    return origDatablockInstance;
  }

  async checkPermissionsForOrigDatablock(
    request: Request,
    id: string,
    group: Action,
  ) {
    const origDatablock = await this.origDatablocksService.findOne({ _id: id });
    if (!origDatablock) {
      throw new NotFoundException(`OrigDatablock: ${id} not found`);
    }

    await this.checkPermissionsForOrigDatablockExtended(
      request,
      origDatablock.datasetId,
      group,
    );

    return origDatablock;
  }

  async checkPermissionsForOrigDatablockExtended(
    request: Request,
    id: string,
    group: Action,
  ) {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    const user: JWTUser = request.user as JWTUser;

    if (!dataset) {
      throw new NotFoundException(
        `Dataset: ${id} not found for attaching an origdatablock`,
      );
    }

    const origDatablockInstance =
      await this.generateOrigDatablockInstanceInstanceForPermissions(dataset);

    const ability = this.caslAbilityFactory.origDatablockInstanceAccess(user);

    let canDoAction = false;

    if (group == Action.OrigdatablockCreate) {
      canDoAction =
        ability.can(Action.OrigdatablockCreateAny, origDatablockInstance) ||
        ability.can(Action.OrigdatablockCreateOwner, origDatablockInstance);
    } else if (group == Action.OrigdatablockRead) {
      canDoAction =
        ability.can(Action.OrigdatablockReadAny, origDatablockInstance) ||
        ability.can(Action.OrigdatablockReadOnePublic, origDatablockInstance) ||
        ability.can(Action.OrigdatablockReadOneAccess, origDatablockInstance) ||
        ability.can(Action.OrigdatablockReadOneOwner, origDatablockInstance);
    } else if (group == Action.OrigdatablockUpdate) {
      canDoAction =
        ability.can(Action.OrigdatablockUpdateAny, origDatablockInstance) ||
        ability.can(Action.OrigdatablockUpdateOwner, origDatablockInstance);
    }

    if (!canDoAction) {
      throw new ForbiddenException("Unauthorized access");
    }

    return dataset;
  }

  addAccessBasedFilters(
    user: JWTUser,
    filter: IOrigDatablockFiltersV4<
      OrigDatablockDocument,
      IOrigDatablockFields
    >,
  ): IOrigDatablockFiltersV4<OrigDatablockDocument, IOrigDatablockFields> {
    const ability = this.caslAbilityFactory.datasetInstanceAccess(user);
    const canViewAny = ability.can(Action.DatasetReadAny, DatasetClass);
    const canViewOwner = ability.can(Action.DatasetReadManyOwner, DatasetClass);
    const canViewAccess = ability.can(
      Action.DatasetReadManyAccess,
      DatasetClass,
    );

    if (!filter.where) {
      filter.where = {};
    }

    if (!canViewAny) {
      if (canViewAccess) {
        if (filter.where["$and"]) {
          filter.where["$and"].push({
            $or: [
              { ownerGroup: { $in: user.currentGroups } },
              { accessGroups: { $in: user.currentGroups } },
              { sharedWith: { $in: [user.email] } },
              { isPublished: true },
            ],
          });
        } else {
          filter.where["$and"] = [
            {
              $or: [
                { ownerGroup: { $in: user.currentGroups } },
                { accessGroups: { $in: user.currentGroups } },
                { sharedWith: { $in: [user.email] } },
                { isPublished: true },
              ],
            },
          ];
        }
      } else if (canViewOwner) {
        filter.where = {
          ...filter.where,
          ownerGroup: { $in: user.currentGroups },
        };
      }
    }

    return filter;
  }

  async updateDatasetSizeAndFiles(pid: string) {
    //TODO: Could add additional query filters
    const parsedFilters: IFilters<OrigDatablockDocument, IOrigDatablockFields> =
      { where: { datasetId: pid } };
    const datasetOrigdatablocks =
      (await this.origDatablocksService.findAllComplete(parsedFilters) as OutputOrigDatablockDto[]);

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

  // POST /origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies("origdatablocks", (ability: AppAbility) =>
    ability.can(Action.OrigdatablockCreate, OrigDatablock),
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({
    summary: "It creates a new origdatablock for the specified dataset",
    description:
      "It creates a new original datablock for the specified dataset. It contains the list of files associated with the datasets. Each dataset can have more than one orig datablocks.",
  })
  @ApiBody({
    description: "Input fields for the origdatablock to be created",
    required: true,
    type: CreateOrigDatablockDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: OutputOrigDatablockDto,
    description:
      "Create a new origdatablock and return its representation in SciCat",
  })
  async create(
    @Req() request: Request,
    @Body() createOrigDatablockDto: CreateOrigDatablockDto,
  ): Promise<OrigDatablock> {
    const dataset = await this.checkPermissionsForOrigDatablockExtended(
      request,
      createOrigDatablockDto.datasetId,
      Action.OrigdatablockCreate,
    );

    if (dataset) {
      createOrigDatablockDto = {
        ...createOrigDatablockDto,
        ownerGroup: dataset.ownerGroup,
        accessGroups: dataset.accessGroups,
        instrumentGroup: dataset.instrumentGroup,
      };
    }

    const origdatablock = await this.origDatablocksService.create(
      createOrigDatablockDto,
    );

    await this.updateDatasetSizeAndFiles(dataset.pid);

    return origdatablock;
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("origdatablocks", (ability: AppAbility) =>
    ability.can(Action.OrigdatablockCreate, OrigDatablock),
  )
  @HttpCode(HttpStatus.OK)
  @Post("/isValid")
  @ApiOperation({
    summary: "It validates the origdatablock provided as input",
    description:
      "It validates the original datablock provided as input, and returns true if the information is a valid dataset.",
  })
  @ApiBody({
    description:
      "Input fields for the origdatablock that needs to be validated",
    required: true,
    type: OrigDatablock,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: IsValidResponse,
    description:
      "Check if the origdatablock provided passes validation. It returns true if the validation is passed.",
  })
  async isValid(
    @Req() request: Request,
    @Body() createOrigDatablock: unknown,
  ): Promise<IsValidResponse> {
    await this.checkPermissionsForOrigDatablockExtended(
      request,
      (createOrigDatablock as CreateOrigDatablockDto).datasetId,
      Action.OrigdatablockCreate,
    );
    const dtoTestOrigDatablock = plainToInstance(
      CreateOrigDatablockDto,
      createOrigDatablock,
    );

    const errors = await validate(dtoTestOrigDatablock);

    const valid = errors.length === 0;

    return { valid: valid, reason: errors };
  }

  // GET /origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies("origdatablocks", (ability: AppAbility) =>
    ability.can(Action.OrigdatablockRead, OrigDatablock),
  )
  @Get()
  @ApiOperation({
    summary: "It returns a list of origdatablocks",
    description:
      "It returns a list of original datablocks. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieving origdatablocks",
    required: false,
    type: String,
    example: getSwaggerOrigDatablockFilterContent(),
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PartialOutputOrigDatablockDto,
    isArray: true,
    description: "Return the origdatablocks requested",
  })
  async findAll(
    @Req() request: Request,
    @Query("filter", new FilterValidationPipe(), new IncludeValidationPipe())
    queryFilter: string,
  ): Promise<PartialOutputOrigDatablockDto[]> {
    const parsedFilter = JSON.parse(queryFilter ?? "{}");
    const mergedFilter = this.addAccessBasedFilters(
      request.user as JWTUser,
      parsedFilter,
    );

    const origdatablocks =
      await this.origDatablocksService.findAllComplete(mergedFilter);

    return origdatablocks;
  }

  // GET /origdatablocks/fullfacet
  @UseGuards(PoliciesGuard)
  @CheckPolicies("origdatablocks", (ability: AppAbility) =>
    ability.can(Action.OrigdatablockRead, OrigDatablock),
  )
  @Get("/fullfacet")
  @ApiQuery({
    name: "filters",
    description:
      "Defines list of field names, for which facet counts should be calculated",
    required: false,
    type: FullFacetFilters,
    example:
      '{"facets": ["type","creationLocation","ownerGroup","keywords"], fields: {}}',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FullFacetResponse,
    isArray: true,
    description: "Return fullfacet response for origdatablocks requested",
  })
  async fullfacet(
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IOrigDatablockFields = JSON.parse(filters.fields ?? "{}");

    const ability = this.caslAbilityFactory.origDatablockInstanceAccess(user);
    const canViewAny = ability.can(Action.OrigdatablockReadAny, OrigDatablock);
    if (!canViewAny) {
      const canViewAccess = ability.can(
        Action.OrigdatablockReadManyAccess,
        OrigDatablock,
      );
      const canViewOwner = ability.can(
        Action.OrigdatablockReadManyOwner,
        OrigDatablock,
      );

      if (canViewAccess) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      } else if (canViewOwner) {
        fields.ownerGroup = fields.ownerGroup ?? [];
        fields.ownerGroup.push(...user.currentGroups);
      }
    }
    const parsedFilters: IFacets<IOrigDatablockFields> = {
      fields: fields,
      facets: JSON.parse(filters.facets ?? "{}"),
    };

    return this.origDatablocksService.fullfacet(parsedFilters);
  }

  // GET /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies("origdatablocks", (ability: AppAbility) =>
    ability.can(Action.OrigdatablockRead, OrigDatablock),
  )
  @Get("/:id")
  @ApiOperation({
    summary: "It retrieves the origdatablock",
    description: "It retrieves the original datablock with the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the origdatablock to be retrieved",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The origdatablock requested",
    type: OutputOrigDatablockDto,
  })
  @ApiQuery({
    name: "include",
    enum: OrigDatablockLookupKeysEnum,
    type: String,
    required: false,
    isArray: true,
  })
  async findById(
    @Req() request: Request,
    @Param("id") id: string,
    @Query("include", new IncludeValidationPipe())
    include: OrigDatablockLookupKeysEnum[] | OrigDatablockLookupKeysEnum,
  ): Promise<OutputOrigDatablockDto | null> {
    const includeArray = Array.isArray(include)
      ? include
      : include && Array(include);

    const origdatablock = await this.origDatablocksService.findOneComplete({
      where: { _id: id },
      include: includeArray,
    });

    await this.checkPermissionsForOrigDatablock(
      request,
      id,
      Action.OrigdatablockRead,
    );

    return origdatablock;
  }

  // PATCH /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies("origdatablocks", (ability: AppAbility) =>
    ability.can(Action.OrigdatablockUpdate, OrigDatablock),
  )
  @Patch("/:id")
  @ApiOperation({
    summary: "It updates the origdatablock",
    description: "It updates the original datablock with the id specified.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the origdatablock to be updated",
    type: String,
  })
  @ApiBody({
    description:
      "Origdatablock object that needs to be updated. Only the origdatablock object fields that need to be updated should be passed in.",
    required: true,
    type: PartialUpdateOrigDatablockDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The updated origdatablock",
    type: OutputOrigDatablockDto,
  })
  async findByIdAndUpdate(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() updateOrigDatablockDto: PartialUpdateOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    await this.checkPermissionsForOrigDatablock(
      request,
      id,
      Action.OrigdatablockUpdate,
    );

    const origdatablock = await this.origDatablocksService.findByIdAndUpdate(
      id,
      updateOrigDatablockDto,
    );

    if (origdatablock) {
      await this.updateDatasetSizeAndFiles(origdatablock.datasetId);
    }

    return origdatablock;
  }

  // DELETE /origdatablocks/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies("origdatablocks", (ability: AppAbility) =>
    ability.can(Action.OrigdatablockDelete, OrigDatablock),
  )
  @Delete("/:id")
  @ApiOperation({
    summary: "It deletes the origdatablock",
    description: "It deletes the original datablock specified by the id.",
  })
  @ApiParam({
    name: "id",
    description: "Id of the origdatablock to be deleted",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputOrigDatablockDto,
    description: "Removed origdatablock value is returned",
  })
  async findByIdAndDelete(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<OutputOrigDatablockDto | null> {
    await this.checkPermissionsForOrigDatablock(
      request,
      id,
      Action.OrigdatablockDelete,
    );

    const origdatablock =
      await this.origDatablocksService.findByIdAndDelete(id);

    if (origdatablock) {
      await this.updateDatasetSizeAndFiles(origdatablock.datasetId);
    }

    return origdatablock;
  }
}
