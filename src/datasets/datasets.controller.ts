/* eslint-disable @typescript-eslint/quotes */
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Patch,
  Put,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  HttpException,
  NotFoundException,
  Req,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { MongoError } from "mongodb";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { Request } from "express";
import { DatasetsService } from "./datasets.service";
import { PartialUpdateDatasetDto } from "./dto/update-dataset.dto";
import { DatasetClass, DatasetDocument } from "./schemas/dataset.schema";
import { CreateRawDatasetDto } from "./dto/create-raw-dataset.dto";
import { CreateDerivedDatasetDto } from "./dto/create-derived-dataset.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { IDatasetFields } from "./interfaces/dataset-filters.interface";
import {
  MainDatasetsPublicInterceptor,
  SubDatasetsPublicInterceptor,
} from "./interceptors/datasets-public.interceptor";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { AttachmentsService } from "src/attachments/attachments.service";
import { UpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";
import { OrigDatablock } from "src/origdatablocks/schemas/origdatablock.schema";
import { CreateOrigDatablockDto } from "src/origdatablocks/dto/create-origdatablock.dto";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { UpdateOrigDatablockDto } from "src/origdatablocks/dto/update-origdatablock.dto";
import { DatablocksService } from "src/datablocks/datablocks.service";
import { Datablock } from "src/datablocks/schemas/datablock.schema";
import { CreateDatablockDto } from "src/datablocks/dto/create-datablock.dto";
import { PartialUpdateDatablockDto } from "src/datablocks/dto/update-datablock.dto";
import { UpdateQuery } from "mongoose";
import { FilterPipe } from "src/common/pipes/filter.pipe";
import { UTCTimeInterceptor } from "src/common/interceptors/utc-time.interceptor";
import { DataFile } from "src/common/schemas/datafile.schema";
import { MultiUTCTimeInterceptor } from "src/common/interceptors/multi-utc-time.interceptor";
import { FullQueryInterceptor } from "./interceptors/fullquery.interceptor";
import { FormatPhysicalQuantitiesInterceptor } from "src/common/interceptors/format-physical-quantities.interceptor";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate, ValidationError, ValidatorOptions } from "class-validator";
import { HistoryInterceptor } from "src/common/interceptors/history.interceptor";
import { CreateDatasetOrigDatablockDto } from "src/origdatablocks/dto/create-dataset-origdatablock";
import {
  PartialUpdateRawDatasetDto,
  UpdateRawDatasetDto,
} from "./dto/update-raw-dataset.dto";
import {
  PartialUpdateDerivedDatasetDto,
  UpdateDerivedDatasetDto,
} from "./dto/update-derived-dataset.dto";
import { CreateDatasetDatablockDto } from "src/datablocks/dto/create-dataset-datablock";
import {
  filterDescription,
  filterExample,
  datasetsFullQueryDescriptionFields,
  fullQueryDescriptionLimits,
  datasetsFullQueryExampleFields,
  fullQueryExampleLimits,
  replaceLikeOperator,
} from "src/common/utils";
import { HistoryClass } from "./schemas/history.schema";
import { TechniqueClass } from "./schemas/technique.schema";
import { RelationshipClass } from "./schemas/relationship.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { LogbooksService } from "src/logbooks/logbooks.service";
import configuration from "src/config/configuration";
import { DatasetType } from "./dataset-type.enum";

@ApiBearerAuth()
@ApiExtraModels(
  CreateAttachmentDto,
  CreateDerivedDatasetDto,
  CreateRawDatasetDto,
  HistoryClass,
  TechniqueClass,
  RelationshipClass,
)
@ApiTags("datasets")
@Controller("datasets")
export class DatasetsController {
  constructor(
    private attachmentsService: AttachmentsService,
    private datablocksService: DatablocksService,
    private datasetsService: DatasetsService,
    private origDatablocksService: OrigDatablocksService,
    private caslAbilityFactory: CaslAbilityFactory,
    private logbooksService: LogbooksService,
  ) {}

  getFilters(
    headers: Record<string, string>,
    queryFilter: { filter?: string },
  ) {
    // NOTE: If both headers and query filters are present return error because we don't want to support this scenario.
    if (queryFilter?.filter && (headers?.filter || headers?.where)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message:
            "Using two different types(query and headers) of filters is not supported and can result with inconsistencies",
        },
        HttpStatus.BAD_REQUEST,
      );
    } else if (queryFilter?.filter) {
      const jsonQueryFilters: IFilters<DatasetDocument, IDatasetFields> =
        JSON.parse(queryFilter.filter);

      return jsonQueryFilters;
    } else if (headers?.filter) {
      const jsonHeadersFilters: IFilters<DatasetDocument, IDatasetFields> =
        JSON.parse(headers.filter);

      return jsonHeadersFilters;
    } else if (headers?.where) {
      const jsonHeadersWhereFilters: IFilters<DatasetDocument, IDatasetFields> =
        JSON.parse(headers.where);

      return jsonHeadersWhereFilters;
    }

    return {};
  }

  updateMergedFiltersForList(
    request: Request,
    mergedFilters: IFilters<DatasetDocument, IDatasetFields>,
  ): IFilters<DatasetDocument, IDatasetFields> {
    const user: JWTUser = request.user as JWTUser;

    const ability = this.caslAbilityFactory.createDatasetForUser(user);
    const canViewAny = ability.can(Action.DatasetReadAny, DatasetClass);
    const canViewOwner = ability.can(Action.DatasetReadManyOwner, DatasetClass);
    const canViewAccess = ability.can(
      Action.DatasetReadManyAccess,
      DatasetClass,
    );
    const canViewPublic = ability.can(
      Action.DatasetReadManyPublic,
      DatasetClass,
    );

    if (!canViewAny) {
      if (!mergedFilters.where) {
        mergedFilters.where = {};
      }
      if (canViewAccess) {
        mergedFilters.where["$or"] = [
          { ownerGroup: { $in: user.currentGroups } },
          { accessGroups: { $in: user.currentGroups } },
          { sharedWith: { $in: user.email } },
          { isPublished: true },
        ];
      } else if (canViewOwner) {
        mergedFilters.where = [{ ownerGroup: { $in: user.currentGroups } }];
      } else if (canViewPublic) {
        mergedFilters.where = { isPublished: true };
      }
    }

    return mergedFilters;
  }

  async checkPermissionsForDatasetExtended(
    request: Request,
    id: string,
    group: Action,
  ) {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    const user: JWTUser = request.user as JWTUser;

    if (dataset) {
      const datasetInstance =
        await this.generateDatasetInstanceForPermissions(dataset);

      const ability = this.caslAbilityFactory.createDatasetForUser(user);

      let canDoAction = false;

      if (group == Action.DatasetRead) {
        canDoAction =
          ability.can(Action.DatasetReadAny, DatasetClass) ||
          ability.can(Action.DatasetReadOneOwner, datasetInstance) ||
          ability.can(Action.DatasetReadOneAccess, datasetInstance) ||
          ability.can(Action.DatasetReadOnePublic, datasetInstance);
      } else if (group == Action.DatasetAttachmentRead) {
        canDoAction =
          ability.can(Action.DatasetAttachmentReadAny, DatasetClass) ||
          ability.can(Action.DatasetAttachmentReadOwner, datasetInstance) ||
          ability.can(Action.DatasetAttachmentReadAccess, datasetInstance) ||
          ability.can(Action.DatasetAttachmentReadPublic, datasetInstance);
      } else if (group == Action.DatasetAttachmentCreate) {
        canDoAction =
          ability.can(Action.DatasetAttachmentCreateAny, DatasetClass) ||
          ability.can(Action.DatasetAttachmentCreateOwner, datasetInstance);
      } else if (group == Action.DatasetAttachmentUpdate) {
        canDoAction =
          ability.can(Action.DatasetAttachmentUpdateAny, DatasetClass) ||
          ability.can(Action.DatasetAttachmentUpdateOwner, datasetInstance);
      } else if (group == Action.DatasetAttachmentDelete) {
        canDoAction =
          ability.can(Action.DatasetAttachmentDeleteAny, DatasetClass) ||
          ability.can(Action.DatasetAttachmentDeleteOwner, datasetInstance);
      } else if (group == Action.DatasetOrigdatablockRead) {
        canDoAction =
          ability.can(Action.DatasetOrigdatablockReadAny, DatasetClass) ||
          ability.can(Action.DatasetOrigdatablockReadOwner, datasetInstance) ||
          ability.can(Action.DatasetOrigdatablockReadAccess, datasetInstance) ||
          ability.can(Action.DatasetOrigdatablockReadPublic, datasetInstance);
      } else if (group == Action.DatasetOrigdatablockCreate) {
        canDoAction =
          ability.can(Action.DatasetOrigdatablockCreateAny, DatasetClass) ||
          ability.can(Action.DatasetOrigdatablockCreateOwner, datasetInstance);
      } else if (group == Action.DatasetOrigdatablockUpdate) {
        canDoAction =
          ability.can(Action.DatasetOrigdatablockUpdateAny, DatasetClass) ||
          ability.can(Action.DatasetOrigdatablockUpdateOwner, datasetInstance);
      } else if (group == Action.DatasetOrigdatablockDelete) {
        canDoAction =
          ability.can(Action.DatasetOrigdatablockDeleteAny, DatasetClass) ||
          ability.can(Action.DatasetOrigdatablockDeleteOwner, datasetInstance);
      } else if (group == Action.DatasetDatablockRead) {
        canDoAction =
          ability.can(Action.DatasetOrigdatablockReadAny, DatasetClass) ||
          ability.can(Action.DatasetDatablockReadOwner, datasetInstance) ||
          ability.can(Action.DatasetDatablockReadAccess, datasetInstance) ||
          ability.can(Action.DatasetDatablockReadPublic, datasetInstance);
      } else if (group == Action.DatasetDatablockCreate) {
        canDoAction =
          ability.can(Action.DatasetDatablockCreateAny, DatasetClass) ||
          ability.can(Action.DatasetDatablockCreateOwner, datasetInstance);
      } else if (group == Action.DatasetDatablockUpdate) {
        canDoAction =
          ability.can(Action.DatasetDatablockUpdateAny, DatasetClass) ||
          ability.can(Action.DatasetDatablockUpdateOwner, datasetInstance);
      } else if (group == Action.DatasetDatablockDelete) {
        canDoAction =
          ability.can(Action.DatasetDatablockDeleteAny, DatasetClass) ||
          ability.can(Action.DatasetDatablockDeleteOwner, datasetInstance);
      } else if (group == Action.DatasetLogbookRead) {
        canDoAction =
          ability.can(Action.DatasetLogbookReadAny, DatasetClass) ||
          ability.can(Action.DatasetLogbookReadOwner, datasetInstance);
      }
      if (!canDoAction) {
        throw new ForbiddenException("Unauthorized access");
      }
    }

    return dataset;
  }

  async checkPermissionsForDataset(request: Request, id: string) {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    const user: JWTUser = request.user as JWTUser;

    if (dataset) {
      const datasetInstance =
        await this.generateDatasetInstanceForPermissions(dataset);

      const ability = this.caslAbilityFactory.createDatasetForUser(user);
      const canView =
        ability.can(Action.DatasetReadAny, DatasetClass) ||
        ability.can(Action.DatasetReadOneOwner, datasetInstance) ||
        ability.can(Action.DatasetReadOneAccess, datasetInstance) ||
        ability.can(Action.DatasetReadOnePublic, datasetInstance);

      if (!canView) {
        throw new ForbiddenException("Unauthorized access");
      }
    }

    return dataset;
  }

  getUserPermissionsFromGroups(user: JWTUser) {
    const userIsAdmin = user.currentGroups.some((g) =>
      configuration().adminGroups.includes(g),
    );
    const userCanCreateDatasetPrivileged =
      configuration().createDatasetPrivilegedGroups.some((value) =>
        user.currentGroups.includes(value),
      );
    const userCanCreateDatasetWithPid =
      configuration().createDatasetWithPidGroups.some((value) =>
        user.currentGroups.includes(value),
      );
    const userCanCreateDatasetWithoutPid =
      configuration().createDatasetGroups.some((value) =>
        user.currentGroups.includes(value),
      );

    return {
      userIsAdmin,
      userCanCreateDatasetPrivileged,
      userCanCreateDatasetWithPid,
      userCanCreateDatasetWithoutPid,
    };
  }

  async generateDatasetInstanceForPermissions(
    dataset: CreateRawDatasetDto | CreateDerivedDatasetDto | DatasetClass,
  ): Promise<DatasetClass> {
    const datasetInstance = new DatasetClass();
    datasetInstance._id = "";
    datasetInstance.pid = dataset.pid || "";
    datasetInstance.accessGroups = dataset.accessGroups || [];
    datasetInstance.ownerGroup = dataset.ownerGroup;
    datasetInstance.sharedWith = dataset.sharedWith;
    datasetInstance.isPublished = dataset.isPublished || false;

    return datasetInstance;
  }

  async checkPermissionsForDatasetCreate(
    request: Request,
    dataset: CreateRawDatasetDto | CreateDerivedDatasetDto,
  ) {
    const user: JWTUser = request.user as JWTUser;

    if (dataset) {
      // NOTE: We need DatasetClass instance because casl module can not recognize the type from dataset mongo database model. If other fields are needed can be added later.
      const datasetInstance =
        await this.generateDatasetInstanceForPermissions(dataset);
      // instantiate the casl matrix for the user
      const ability = this.caslAbilityFactory.createDatasetForUser(user);
      // check if he/she can create this dataset
      const canCreate =
        ability.can(Action.DatasetCreateAny, DatasetClass) ||
        ability.can(Action.DatasetCreateOwnerNoPid, datasetInstance) ||
        ability.can(Action.DatasetCreateOwnerWithPid, datasetInstance);

      if (!canCreate) {
        throw new ForbiddenException("Unauthorized to create this dataset");
      }

      // now checks if we need to validate the pid
      if (
        configuration().datasetCreationValidationEnabled &&
        configuration().datasetCreationValidationRegex &&
        dataset.pid
      ) {
        const re = new RegExp(configuration().datasetCreationValidationRegex);

        if (!re.test(dataset.pid)) {
          throw new BadRequestException(
            "PID is not following required standards",
          );
        }
      }
    } else {
      throw new ForbiddenException("Unauthorized to create datasets");
    }

    return dataset;
  }

  // POST /datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetCreate, DatasetClass),
  )
  @UseInterceptors(
    new UTCTimeInterceptor<DatasetClass>(["creationTime"]),
    new UTCTimeInterceptor<DatasetClass>(["endTime"]),
    new FormatPhysicalQuantitiesInterceptor<DatasetClass>("scientificMetadata"),
  )
  @Post()
  @ApiOperation({
    summary: "It creates a new dataset which can be a raw or derived one.",
    description:
      "It creates a new dataset and returns it completed with systems fields.",
  })
  @ApiExtraModels(CreateRawDatasetDto, CreateDerivedDatasetDto)
  @ApiBody({
    description: "Input fields for the dataset to be created",
    required: true,
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateRawDatasetDto) },
        { $ref: getSchemaPath(CreateDerivedDatasetDto) },
      ],
    },
  })
  @ApiResponse({
    status: 201,
    type: DatasetClass,
    description: "Create a new dataset and return its representation in SciCat",
  })
  async create(
    @Req() request: Request,
    @Body() createDatasetDto: CreateRawDatasetDto | CreateDerivedDatasetDto,
  ): Promise<DatasetClass> {
    // validate dataset
    await this.validateDataset(
      createDatasetDto,
      createDatasetDto.type === "raw"
        ? CreateRawDatasetDto
        : CreateDerivedDatasetDto,
    );

    const datasetDTO = await this.checkPermissionsForDatasetCreate(
      request,
      createDatasetDto,
    );

    try {
      const createdDataset = await this.datasetsService.create(datasetDTO);

      return createdDataset;
    } catch (error) {
      if ((error as MongoError).code === 11000) {
        throw new ConflictException(
          "A dataset with this this unique key already exists!",
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateDataset(
    inputDatasetDto:
      | CreateRawDatasetDto
      | CreateDerivedDatasetDto
      | PartialUpdateRawDatasetDto
      | PartialUpdateDerivedDatasetDto
      | UpdateRawDatasetDto
      | UpdateDerivedDatasetDto,
    dto: ClassConstructor<
      | CreateRawDatasetDto
      | CreateDerivedDatasetDto
      | PartialUpdateRawDatasetDto
      | PartialUpdateDerivedDatasetDto
      | UpdateRawDatasetDto
      | UpdateDerivedDatasetDto
    >,
  ) {
    const validateOptions: ValidatorOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: {
        value: false,
        target: false,
      },
    };

    if (
      inputDatasetDto instanceof
      (CreateRawDatasetDto || CreateDerivedDatasetDto)
    ) {
      if (!(inputDatasetDto.type in DatasetType)) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Wrong dataset type!",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const outputDatasetDto = plainToInstance(dto, inputDatasetDto);
    const errors = await validate(outputDatasetDto, validateOptions);

    if (errors.length > 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: JSON.stringify(errors),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return outputDatasetDto;
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetCreate, DatasetClass),
  )
  @UseInterceptors(
    new UTCTimeInterceptor<DatasetClass>(["creationTime"]),
    new UTCTimeInterceptor<DatasetClass>(["endTime"]),
    new FormatPhysicalQuantitiesInterceptor<DatasetClass>("scientificMetadata"),
  )
  @HttpCode(HttpStatus.OK)
  @Post("/isValid")
  @ApiOperation({
    summary: "It validates the dataset provided as input.",
    description:
      "It validates the dataset provided as input, and returns true if the information is a valid dataset",
  })
  @ApiExtraModels(CreateRawDatasetDto, CreateDerivedDatasetDto)
  @ApiBody({
    description: "Input fields for the dataset that needs to be validated",
    required: true,
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateRawDatasetDto) },
        { $ref: getSchemaPath(CreateDerivedDatasetDto) },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    type: Boolean,
    description:
      "Check if the dataset provided pass validation. It return true if the validation is passed",
  })
  async isValid(
    @Req() request: Request,
    @Body() createDatasetDto: CreateRawDatasetDto | CreateDerivedDatasetDto,
  ): Promise<{ valid: boolean }> {
    await this.checkPermissionsForDatasetCreate(request, createDatasetDto);

    const dtoTestRawCorrect = plainToInstance(
      CreateRawDatasetDto,
      createDatasetDto,
    );
    const errorsTestRawCorrect = await validate(dtoTestRawCorrect);

    const dtoTestDerivedCorrect = plainToInstance(
      CreateDerivedDatasetDto,
      createDatasetDto,
    );
    const errorsTestDerivedCorrect = await validate(dtoTestDerivedCorrect);

    const valid =
      errorsTestRawCorrect.length == 0 || errorsTestDerivedCorrect.length == 0;

    return { valid: valid };
  }

  // GET /datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  @UseInterceptors(MainDatasetsPublicInterceptor)
  @Get()
  @ApiOperation({
    summary: "It returns a list of datasets.",
    description:
      "It returns a list of datasets. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving datasets\n" +
      filterDescription,
    required: false,
    type: String,
    example: filterExample,
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    isArray: true,
    description: "Return the datasets requested",
  })
  async findAll(
    @Req() request: Request,
    @Headers() headers: Record<string, string>,
    @Query(new FilterPipe()) queryFilter: { filter?: string },
  ): Promise<DatasetClass[] | null> {
    const mergedFilters = replaceLikeOperator(
      this.updateMergedFiltersForList(
        request,
        this.getFilters(headers, queryFilter),
      ) as Record<string, unknown>,
    ) as IFilters<DatasetDocument, IDatasetFields>;

    // this should be implemented at database level
    const datasets = await this.datasetsService.findAll(mergedFilters);
    if (datasets && datasets.length > 0) {
      const includeFilters = mergedFilters.include ?? [];
      await Promise.all(
        datasets.map(async (dataset) => {
          if (includeFilters) {
            await Promise.all(
              includeFilters.map(async ({ relation }) => {
                switch (relation) {
                  case "attachments": {
                    dataset.attachments = await this.attachmentsService.findAll(
                      {
                        datasetId: dataset.pid,
                      },
                    );
                    break;
                  }
                  case "origdatablocks": {
                    dataset.origdatablocks =
                      await this.origDatablocksService.findAll({
                        datasetId: dataset.pid,
                      });
                    break;
                  }
                  case "datablocks": {
                    dataset.datablocks = await this.datablocksService.findAll({
                      datasetId: dataset.pid,
                    });
                    break;
                  }
                }
              }),
            );
          } else {
            dataset;
          }
        }),
      );
    }
    return datasets;
  }

  // GET /datasets/fullquery
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  @UseInterceptors(SubDatasetsPublicInterceptor, FullQueryInterceptor)
  @Get("/fullquery")
  @ApiOperation({
    summary: "It returns a list of datasets matching the query provided.",
    description:
      "It returns a list of datasets matching the query provided.<br>This endpoint still needs some work on the query specification.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Database filters to apply when retrieving datasets\n" +
      datasetsFullQueryDescriptionFields,
    required: false,
    type: String,
    example: datasetsFullQueryExampleFields,
  })
  @ApiQuery({
    name: "limits",
    description:
      "Define further query parameters like skip, limit, order\n" +
      fullQueryDescriptionLimits,
    required: false,
    type: String,
    example: fullQueryExampleLimits,
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    isArray: true,
    description: "Return datasets requested",
  })
  async fullquery(
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<DatasetClass[] | null> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IDatasetFields = JSON.parse(filters.fields ?? "{}");

    const ability = this.caslAbilityFactory.createDatasetForUser(user);
    const canViewAny = ability.can(Action.DatasetReadAny, DatasetClass);

    if (!canViewAny && !fields.isPublished) {
      const canViewAccess = ability.can(
        Action.DatasetReadManyAccess,
        DatasetClass,
      );
      const canViewOwner = ability.can(
        Action.DatasetReadManyOwner,
        DatasetClass,
      );
      // const canViewPublic = ability.can(
      //   Action.DatasetReadManyPublic,
      //   DatasetClass,
      // );
      if (canViewAccess) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
        // fields.sharedWith = user.email;
      } else if (canViewOwner) {
        fields.ownerGroup = fields.ownerGroup ?? [];
        fields.ownerGroup.push(...user.currentGroups);
      }
      // else if (canViewPublic) {
      //   fields.isPublished = true;
      // }
    }
    const parsedFilters: IFilters<DatasetDocument, IDatasetFields> = {
      fields: fields,
      limits: JSON.parse(filters.limits ?? "{}"),
    };

    return this.datasetsService.fullquery(parsedFilters);
  }

  // GET /fullfacets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  @UseInterceptors(SubDatasetsPublicInterceptor)
  @Get("/fullfacet")
  @ApiOperation({
    summary:
      "It returns a list of dataset facets matching the filter provided.",
    description:
      "It returns a list of dataset facets matching the filter provided.<br>This endpoint still needs some work on the filter and facets specification.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Define the filter conditions by specifying the name of values of fields requested. There is also support for a `text` search to look for strings anywhere in the dataset.",
    required: false,
    type: String,
    example: {},
  })
  @ApiQuery({
    name: "facets",
    description:
      "Defines list of field names, for which facet counts should be calculated",
    required: false,
    type: String,
    example: '["type","creationLocation","ownerGroup","keywords"]',
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    isArray: true,
    description: "Return datasets requested",
  })
  async fullfacet(
    @Req() request: Request,
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IDatasetFields = JSON.parse(filters.fields ?? "{}");

    const ability = this.caslAbilityFactory.createDatasetForUser(user);
    const canViewAny = ability.can(Action.DatasetReadAny, DatasetClass);

    if (!canViewAny && !fields.isPublished) {
      // delete fields.isPublished;

      const canViewAccess = ability.can(
        Action.DatasetReadManyAccess,
        DatasetClass,
      );
      const canViewOwner = ability.can(
        Action.DatasetReadManyOwner,
        DatasetClass,
      );
      // const canViewPublic = ability.can(
      //   Action.DatasetReadManyPublic,
      //   DatasetClass,
      // );

      if (canViewAccess) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
        // fields.isPublished = true;
        // fields.sharedWith = user.email;
      } else if (canViewOwner) {
        fields.ownerGroup = fields.ownerGroup ?? [];
        fields.ownerGroup.push(...user.currentGroups);
      }
      // else if (canViewPublic) {
      //   fields.isPublished = true;
      // }
    }

    const parsedFilters: IFacets<IDatasetFields> = {
      fields: fields,
      facets: JSON.parse(filters.facets ?? "[]"),
    };
    return this.datasetsService.fullFacet(parsedFilters);
  }

  // GET /datasets/metadataKeys
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  @UseInterceptors(SubDatasetsPublicInterceptor)
  @Get("/metadataKeys")
  @ApiOperation({
    summary:
      "It returns a list of metadata keys contained in the datasets matching the filter provided.",
    description:
      "It returns a list of metadata keys contained in the datasets matching the filter provided.<br>This endpoint still needs some work on the filter and facets specification.",
  })
  @ApiQuery({
    name: "fields",
    description:
      "Define the filter conditions by specifying the name of values of fields requested. There is also support for a `text` search to look for strings anywhere in the dataset.",
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
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    isArray: true,
    description: "Return metadata keys list of datasets selected",
  })
  async metadataKeys(
    @Req() request: Request,
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<string[]> {
    const user: JWTUser = request.user as JWTUser;
    const fields: IDatasetFields = JSON.parse(filters.fields ?? "{}");

    const ability = this.caslAbilityFactory.createDatasetForUser(user);
    const canViewAny = ability.can(Action.DatasetReadAny, DatasetClass);

    if (!canViewAny && !fields.isPublished) {
      // delete fields.isPublished;

      const canViewAccess = ability.can(
        Action.DatasetReadManyAccess,
        DatasetClass,
      );
      const canViewOwner = ability.can(
        Action.DatasetReadManyOwner,
        DatasetClass,
      );
      // const canViewPublic = ability.can(
      //   Action.DatasetReadManyPublic,
      //   DatasetClass,
      // );

      if (canViewAccess) {
        fields.userGroups?.push(...user.currentGroups);
        // fields.sharedWith = user.email;
        // fields.isPublished = true; //are they in or?
      } else if (canViewOwner) {
        fields.ownerGroup?.push(...user.currentGroups);
      }
      // else if (canViewPublic) {
      //   fields.isPublished = true;
      // }
    }

    const parsedFilters: IFilters<DatasetDocument, IDatasetFields> = {
      fields: fields,
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.datasetsService.metadataKeys(parsedFilters);
  }

  // GET /datasets/findOne
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  @Get("/findOne")
  @ApiOperation({
    summary: "It returns the first dataset found.",
    description:
      "It returns the first dataset of the ones that matches the filter provided. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving datasets\n" +
      filterDescription,
    required: false,
    type: String,
    example: filterExample,
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    description: "Return the datasets requested",
  })
  async findOne(
    @Req() request: Request,
    @Headers() headers: Record<string, string>,
    @Query(new FilterPipe()) queryFilter: { filter?: string },
  ): Promise<DatasetClass | null> {
    const mergedFilters = replaceLikeOperator(
      this.updateMergedFiltersForList(
        request,
        this.getFilters(headers, queryFilter),
      ) as Record<string, unknown>,
    ) as IFilters<DatasetDocument, IDatasetFields>;

    const dataset = (await this.datasetsService.findOne(
      mergedFilters,
    )) as DatasetClass;

    if (dataset) {
      const includeFilters = mergedFilters.include ?? [];
      await Promise.all(
        includeFilters.map(async ({ relation }) => {
          switch (relation) {
            case "attachments": {
              dataset.attachments = await this.attachmentsService.findAll({
                datasetId: dataset.pid,
              });
              break;
            }
            case "origdatablocks": {
              dataset.origdatablocks = await this.origDatablocksService.findAll(
                { where: { datasetId: dataset.pid } },
              );
              break;
            }
            case "datablocks": {
              dataset.datablocks = await this.datablocksService.findAll({
                datasetId: dataset.pid,
              });
              break;
            }
          }
        }),
      );
    }
    return dataset;
  }

  // GET /datasets/count
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  @Get("/count")
  @ApiOperation({
    summary: "It returns the number of datasets.",
    description:
      "It returns a number of datasets matching the where filter if provided.",
  })
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieving count for datasets",
    required: false,
    type: String,
    example:
      '{"where": {"pid": "20.500.12269/4f8c991e-a879-4e00-9095-5bb13fb02ac4"}}',
  })
  @ApiResponse({
    status: 200,
    description:
      "Return the number of datasets in the following format: { count: integer }",
  })
  async count(
    @Req() request: Request,
    @Headers() headers: Record<string, string>,
    @Query(new FilterPipe()) queryFilter: { filter?: string },
  ): Promise<{ count: number }> {
    const mergedFilters = replaceLikeOperator(
      this.updateMergedFiltersForList(
        request,
        this.getFilters(headers, queryFilter),
      ) as Record<string, unknown>,
    ) as IFilters<DatasetDocument, IDatasetFields>;

    return this.datasetsService.count(mergedFilters);
  }

  // GET /datasets/:id
  //@UseGuards(PoliciesGuard)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  @Get("/:pid")
  @ApiOperation({
    summary: "It returns the dataset requested.",
    description: "It returns the dataset requested through the pid specified.",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the dataset to return",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    isArray: false,
    description: "Return dataset with pid specified",
  })
  async findById(
    @Req() request: Request,
    @Param("pid") id: string,
  ): Promise<DatasetClass | null> {
    const dataset = await this.checkPermissionsForDataset(request, id);

    return dataset;
  }

  // PATCH /datasets/:id
  // body: modified fields
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetUpdate, DatasetClass),
  )
  @UseInterceptors(
    new UTCTimeInterceptor<DatasetClass>(["creationTime"]),
    new UTCTimeInterceptor<DatasetClass>(["endTime"]),
    new FormatPhysicalQuantitiesInterceptor<DatasetClass>("scientificMetadata"),
    HistoryInterceptor,
  )
  @Patch("/:pid")
  @ApiOperation({
    summary: "It partially updates the dataset.",
    description:
      "It updates the dataset through the pid specified. It updates only the specified fields.",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the dataset to modify",
    type: String,
  })
  @ApiExtraModels(PartialUpdateRawDatasetDto, PartialUpdateDerivedDatasetDto)
  @ApiBody({
    description:
      "Fields that needs to be updated in the dataset. Only the fields that needs to be updated have to be passed in.",
    required: true,
    schema: {
      oneOf: [
        { $ref: getSchemaPath(PartialUpdateRawDatasetDto) },
        { $ref: getSchemaPath(PartialUpdateDerivedDatasetDto) },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    description:
      "Update an existing dataset and return its representation in SciCat",
  })
  async findByIdAndUpdate(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Body()
    updateDatasetDto:
      | PartialUpdateRawDatasetDto
      | PartialUpdateDerivedDatasetDto,
  ): Promise<DatasetClass | null> {
    const foundDataset = await this.datasetsService.findOne({ where: { pid } });

    if (!foundDataset) {
      throw new NotFoundException();
    }

    // NOTE: Default validation pipe does not validate union types. So we need custom validation.
    await this.validateDataset(
      updateDatasetDto,
      foundDataset.type === "raw"
        ? PartialUpdateRawDatasetDto
        : PartialUpdateDerivedDatasetDto,
    );

    // NOTE: We need DatasetClass instance because casl module can not recognize the type from dataset mongo database model. If other fields are needed can be added later.
    const datasetInstance =
      await this.generateDatasetInstanceForPermissions(foundDataset);

    // instantiate the casl matrix for the user
    const user: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.createDatasetForUser(user);
    // check if he/she can create this dataset
    const canUpdate =
      ability.can(Action.DatasetUpdateAny, DatasetClass) ||
      ability.can(Action.DatasetUpdateOwner, datasetInstance);

    if (!canUpdate) {
      throw new ForbiddenException("Unauthorized to update this dataset");
    }

    return this.datasetsService.findByIdAndUpdate(pid, updateDatasetDto);
  }

  // PUT /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetUpdate, DatasetClass),
  )
  @UseInterceptors(
    new UTCTimeInterceptor<DatasetClass>(["creationTime"]),
    new UTCTimeInterceptor<DatasetClass>(["endTime"]),
    new FormatPhysicalQuantitiesInterceptor<DatasetClass>("scientificMetadata"),
    HistoryInterceptor,
  )
  @Put("/:pid")
  @ApiOperation({
    summary: "It updates the dataset.",
    description: `It updates(replaces) the dataset specified through the pid provided. If optional fields are not provided they will be removed.
      The PUT method is responsible for modifying an existing entity. The crucial part about it is that it is supposed to replace an entity.
      Therefore, if we don’t send a field of an entity when performing a PUT request, the missing field should be removed from the document.
      (Caution: This operation could result with data loss if all the dataset fields are not provided)`,
  })
  @ApiParam({
    name: "pid",
    description: "Id of the dataset to modify",
    type: String,
  })
  @ApiExtraModels(UpdateRawDatasetDto, UpdateDerivedDatasetDto)
  @ApiBody({
    description:
      "Dataset object that needs to be updated. The whole dataset object with updated fields have to be passed in.",
    required: true,
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UpdateRawDatasetDto) },
        { $ref: getSchemaPath(UpdateDerivedDatasetDto) },
      ],
    },
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    description:
      "Update an existing dataset and return its representation in SciCat",
  })
  async findByIdAndReplace(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Body() updateDatasetDto: UpdateRawDatasetDto | UpdateDerivedDatasetDto,
  ): Promise<DatasetClass | null> {
    const foundDataset = await this.datasetsService.findOne({ where: { pid } });

    if (!foundDataset) {
      throw new NotFoundException();
    }

    // NOTE: Default validation pipe does not validate union types. So we need custom validation.
    const outputDto = await this.validateDataset(
      updateDatasetDto,
      foundDataset.type === "raw"
        ? UpdateRawDatasetDto
        : UpdateDerivedDatasetDto,
    );

    const datasetInstance =
      await this.generateDatasetInstanceForPermissions(foundDataset);

    // instantiate the casl matrix for the user
    const user: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.createDatasetForUser(user);
    // check if he/she can create this dataset
    const canUpdate =
      ability.can(Action.DatasetUpdateAny, DatasetClass) ||
      ability.can(Action.DatasetUpdateOwner, datasetInstance);

    if (!canUpdate) {
      throw new ForbiddenException("Unauthorized to update this dataset");
    }

    return this.datasetsService.findByIdAndReplace(
      pid,
      outputDto as UpdateRawDatasetDto | UpdateDerivedDatasetDto,
    );
  }

  // DELETE /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetDelete, DatasetClass),
  )
  @Delete("/:pid")
  @ApiOperation({
    summary: "It deletes the dataset.",
    description: "It delete the dataset specified through the pid specified.",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the dataset to be deleted",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned",
  })
  async findByIdAndDelete(
    @Req() request: Request,
    @Param("pid") pid: string,
  ): Promise<unknown> {
    const foundDataset = await this.datasetsService.findOne({ where: { pid } });

    if (!foundDataset) {
      throw new NotFoundException();
    }

    const datasetInstance =
      await this.generateDatasetInstanceForPermissions(foundDataset);

    // instantiate the casl matrix for the user
    const user: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.createDatasetForUser(user);
    // check if he/she can create this dataset
    const canUpdate =
      ability.can(Action.DatasetDeleteAny, DatasetClass) ||
      ability.can(Action.DatasetDeleteOwner, datasetInstance);

    if (!canUpdate) {
      throw new ForbiddenException("Unauthorized to update this dataset");
    }

    return this.datasetsService.findByIdAndDelete(pid);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetUpdate, DatasetClass),
  )
  @Post("/:pid/appendToArrayField")
  @ApiOperation({
    summary: "It appends a new value to the specific field.",
    description:
      "It appends a new value to the specified field of the dataset with provided pid.<br>The SciCat project is reviewing the purpose of this function and will decide if it will be dropped or changed",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the dataset to be modified",
    type: String,
  })
  @ApiQuery({
    name: "fieldName",
    description: "Name of the field to be updated",
    type: String,
  })
  @ApiQuery({
    name: "data",
    description: "Json object with the fields to be updated and their values",
    required: true,
    type: Array,
  })
  @ApiResponse({
    status: 200,
    type: DatasetClass,
    description: "Return new value of the dataset",
  })
  async appendToArrayField(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Query("fieldName") fieldName: string,
    @Query("data") data: string,
  ): Promise<DatasetClass | null> {
    const user: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.createForUser(user);
    const datasetToUpdate = await this.datasetsService.findOne({
      where: { pid: pid },
    });

    if (!datasetToUpdate) {
      throw new NotFoundException();
    }

    const datasetInstance =
      await this.generateDatasetInstanceForPermissions(datasetToUpdate);

    // check if he/she can create this dataset
    const canUpdate =
      ability.can(Action.DatasetDeleteAny, DatasetClass) ||
      ability.can(Action.DatasetDeleteOwner, datasetInstance);

    if (!canUpdate) {
      throw new ForbiddenException("Unauthorized to update this dataset");
    }

    const parsedData = JSON.parse(data);

    const updateQuery: UpdateQuery<DatasetDocument> = {
      $addToSet: {
        [fieldName]: { $each: parsedData },
      },
    };

    return this.datasetsService.findByIdAndUpdate(pid, updateQuery);
  }

  // GET /datasets/:id/thumbnail
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetRead, DatasetClass),
  )
  // @UseGuards(PoliciesGuard)
  @Get("/:pid/thumbnail")
  @ApiOperation({
    summary: "It returns the thumbnail associated with the dataset.",
    description:
      "It returns the thumbnail associated with the dataset with the provided pid.",
  })
  @ApiParam({
    name: "pid",
    description: "Persistent identifier of the dataset",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Attachment,
    description: "Return new value of the dataset",
  })
  async thumbnail(
    @Req() request: Request,
    @Param("pid") pid: string,
  ): Promise<Partial<Attachment>> {
    await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetRead,
    );

    const attachment = await this.attachmentsService.findOne(
      { datasetId: pid },
      { _id: false, thumbnail: true },
    );

    if (!attachment || !attachment.thumbnail) {
      return {};
    }

    return attachment;
  }

  // POST /datasets/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetAttachmentCreate, DatasetClass),
  )
  @HttpCode(HttpStatus.CREATED)
  @Post("/:pid/attachments")
  @ApiOperation({
    summary: "It creates a new attachement for the dataset specified.",
    description:
      "It creates a new attachement for the dataset specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persisten identifier of the dataset we would like to create a new attachment for",
    type: String,
  })
  @ApiExtraModels(CreateAttachmentDto)
  @ApiBody({
    type: CreateAttachmentDto,
  })
  @ApiResponse({
    status: 201,
    type: Attachment,
    description:
      "Returns the new attachment for the dataset identified by the pid specified",
  })
  async createAttachment(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment | null> {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetAttachmentCreate,
    );

    if (dataset) {
      const createAttachment: CreateAttachmentDto = {
        ...createAttachmentDto,
        datasetId: pid,
        ownerGroup: dataset.ownerGroup,
      };
      return this.attachmentsService.create(createAttachment);
    }
    return null;
  }

  // GET /datasets/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetAttachmentRead, DatasetClass),
  )
  @Get("/:pid/attachments")
  @ApiOperation({
    summary: "It returns all the attachments for the dataset specified.",
    description:
      "It returns all the attachments for the dataset specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persisten Identifier of the dataset for which we would like to retrieve all the attachments",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Attachment,
    isArray: true,
    description:
      "Array with all the attachments associated with the dataset with the pid specified",
  })
  async findAllAttachments(
    @Req() request: Request,
    @Param("pid") pid: string,
  ): Promise<Attachment[]> {
    await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetAttachmentRead,
    );

    return this.attachmentsService.findAll({ datasetId: pid });
  }

  // PATCH /datasets/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetAttachmentUpdate, DatasetClass),
  )
  @Put("/:pid/attachments/:aid")
  @ApiOperation({
    summary: "It updates the attachment specified for the dataset indicated.",
    description:
      "It updates the dataset specified by the aid parameter for the dataset indicated by the pid parameter.<br>This endpoint is obsolete and it will removed in future version.<br>Attachments can be updated from the attachment endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persisten identifier of the dataset for which we would like to update the attachment specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Identifier of the attachment of this dataset that we would like to patch",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Attachment,
    isArray: false,
    description: "Returns the attachment updated.",
  })
  async findOneAttachmentAndUpdate(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Param("aid") aid: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetAttachmentUpdate,
    );

    return this.attachmentsService.findOneAndUpdate(
      { _id: aid, datasetId: pid },
      updateAttachmentDto,
    );
  }

  // DELETE /datasets/:pid/attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetAttachmentDelete, DatasetClass),
  )
  @Delete("/:pid/attachments/:aid")
  @ApiOperation({
    summary: "It deletes the attachment from the dataset.",
    description:
      "It deletes the attachment from the dataset.<br>This endpoint is obsolete and will be dropped in future versions.<br>Deleting attachments will be allowed only from the attachments endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset for which we would like to delete the attachment specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Identifier of the attachment of this dataset that we would like to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned.",
  })
  async findOneAttachmentAndRemove(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Param("aid") aid: string,
  ): Promise<unknown> {
    await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetAttachmentDelete,
    );

    return this.attachmentsService.findOneAndDelete({
      _id: aid,
      pid,
    });
  }

  // POST /datasets/:id/origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => {
    return ability.can(Action.DatasetOrigdatablockCreate, DatasetClass);
  })
  @UseInterceptors(
    new MultiUTCTimeInterceptor<OrigDatablock, DataFile>("dataFileList", [
      "time",
    ]),
  )
  @Post("/:pid/origdatablocks")
  @ApiOperation({
    summary: "It creates a new origDatablock for the dataset specified.",
    description:
      "It creates a new original datablock for the dataset specified by the pid passed.<br>This endpoint is obsolete and will be dropped in future versions.<br>Creatign new origDatablocks will be allowed only from the attachments endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "PErsistent identifier of the dataset we would like to create a new original datablock for",
    type: String,
  })
  @ApiExtraModels(CreateDatasetOrigDatablockDto)
  @ApiBody({
    type: CreateDatasetOrigDatablockDto,
  })
  @ApiResponse({
    status: 201,
    type: OrigDatablock,
    description: "It returns the new original datablock created",
  })
  async createOrigDatablock(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Body() createDatasetOrigDatablockDto: CreateDatasetOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetOrigdatablockCreate,
    );

    if (dataset) {
      const createOrigDatablock: CreateOrigDatablockDto = {
        ...createDatasetOrigDatablockDto,
        datasetId: pid,
        ownerGroup: dataset.ownerGroup,
        accessGroups: dataset.accessGroups,
        instrumentGroup: dataset.instrumentGroup,
      };
      const datablock =
        await this.origDatablocksService.create(createOrigDatablock);

      const updateDatasetDto: PartialUpdateDatasetDto = {
        size: dataset.size + datablock.size,
        numberOfFiles: dataset.numberOfFiles + datablock.dataFileList.length,
      };
      await this.datasetsService.findByIdAndUpdate(
        dataset.pid,
        updateDatasetDto,
      );
      return datablock;
    }
    return null;
  }

  // POST /datasets/:id/origdatablocks/isValid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => {
    return ability.can(Action.DatasetOrigdatablockCreate, DatasetClass);
  })
  @HttpCode(HttpStatus.OK)
  @Post("/:pid/origdatablocks/isValid")
  @ApiOperation({
    summary: "It validates the origDatablock values passed.",
    description:
      "It validates the original datablock values pased as input.<br>This endpoint is obsolete and will be dropped in future versions.<br>Validating orginal datablocks will be allowed only from the datablocks endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset we would like to create a new original datablock for",
    type: String,
  })
  @ApiExtraModels(CreateDatasetOrigDatablockDto)
  @ApiBody({
    type: CreateDatasetOrigDatablockDto,
  })
  @ApiResponse({
    status: 201,
    description:
      "It returns true if the values passed in are a valid original datablock",
  })
  async origDatablockIsValid(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Body() createOrigDatablock: unknown,
  ): Promise<{ valid: boolean; errors: ValidationError[] }> {
    await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetOrigdatablockCreate,
    );

    const dtoTestOrigDatablock = plainToInstance(
      CreateDatasetOrigDatablockDto,
      createOrigDatablock,
    );
    const errorsTestOrigDatablock = await validate(dtoTestOrigDatablock);

    const valid = errorsTestOrigDatablock.length == 0;

    return { valid: valid, errors: errorsTestOrigDatablock };
  }

  // GET /datasets/:id/origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => {
    return ability.can(Action.DatasetOrigdatablockRead, DatasetClass);
  })
  @Get("/:pid/origdatablocks")
  @ApiOperation({
    summary: "It returns all the origDatablock for the dataset specified.",
    description:
      "It returns all the original datablocks for the dataset specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset for which we would like to retrieve all the original datablocks",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: OrigDatablock,
    isArray: true,
    description:
      "Array with all the original datablocks associated with the dataset with the pid specified",
  })
  async findAllOrigDatablocks(
    @Req() request: Request,
    @Param("pid") pid: string,
  ): Promise<OrigDatablock[]> {
    await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetOrigdatablockRead,
    );

    return this.origDatablocksService.findAll({ where: { datasetId: pid } });
  }

  // PATCH /datasets/:id/origdatablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => {
    return ability.can(Action.DatasetOrigdatablockUpdate, DatasetClass);
  })
  @UseInterceptors(
    new MultiUTCTimeInterceptor<OrigDatablock, DataFile>("dataFileList", [
      "time",
    ]),
  )
  @Patch("/:pid/origdatablocks/:oid")
  @ApiOperation({
    summary:
      "It updates the origDatablocks specified for the dataset indicated.",
    description:
      "It updates the original datablock specified by the aid parameter for the dataset indicated by the pid parameter.<br>This endpoint is obsolete and it will removed in future version.<br>Original datablocks can be updated from the origdatablocks endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset for which we would like to update the original datablocks specified",
    type: String,
  })
  @ApiParam({
    name: "oid",
    description:
      "Identifier of the original datablock of this dataset that we would like to patch",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: OrigDatablock,
    isArray: false,
    description:
      "Updated values of the original datablock with id specified associated with the dataset with the pid specified",
  })
  async findOneOrigDatablockAndUpdate(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Param("oid") oid: string,
    @Body() updateOrigdatablockDto: UpdateOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetOrigdatablockUpdate,
    );

    const origDatablockBeforeUpdate = await this.origDatablocksService.findOne({
      _id: oid,
    });
    if (dataset && origDatablockBeforeUpdate) {
      const origDatablock = await this.origDatablocksService.update(
        { _id: oid, pid },
        updateOrigdatablockDto,
      );
      if (origDatablock) {
        await this.datasetsService.findByIdAndUpdate(pid, {
          size:
            dataset.size - origDatablockBeforeUpdate.size + origDatablock.size,
          numberOfFiles:
            dataset.numberOfFiles -
            origDatablockBeforeUpdate.dataFileList.length +
            origDatablock.dataFileList.length,
        });
        return origDatablock;
      }
    }
    return null;
  }

  // DELETE /datasets/:id/origdatablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetOrigdatablockDelete, DatasetClass),
  )
  @Delete("/:pid/origdatablocks/:oid")
  @ApiOperation({
    summary: "It deletes the origdatablock from the dataset.",
    description:
      "It deletes the original datablock from the dataset.<br>This endpoint is obsolete and will be dropped in future versions.<br>Deleting original datablocks will be done only from the origdatablocks endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "PErsistent identifier of the dataset for which we would like to delete the original datablock specified",
    type: String,
  })
  @ApiParam({
    name: "oid",
    description:
      "Identifier of the original datablock of this dataset that we would like to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned",
  })
  async findOneOrigDatablockAndRemove(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Param("oid") oid: string,
  ): Promise<unknown> {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetOrigdatablockDelete,
    );

    if (dataset) {
      // remove origdatablock
      const res = await this.origDatablocksService.remove({
        _id: oid,
        datasetId: pid,
      });
      // all the remaining orig datablocks for this dataset
      const odb = await this.origDatablocksService.findAll({
        where: { datasetId: pid },
      });
      // update dataset size and files number
      const updateDatasetDto: PartialUpdateDatasetDto = {
        size: odb.reduce((a, b) => a + b.size, 0),
        numberOfFiles: odb.reduce((a, b) => a + b.dataFileList.length, 0),
      };
      await this.datasetsService.findByIdAndUpdate(
        dataset.pid,
        updateDatasetDto,
      );
      return res;
    }
    return null;
  }

  // POST /datasets/:id/datablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetDatablockCreate, DatasetClass),
  )
  @UseInterceptors(
    new MultiUTCTimeInterceptor<Datablock, DataFile>("dataFileList", ["time"]),
  )
  @Post("/:pid/datablocks")
  @ApiOperation({
    summary: "It creates a new datablock for the dataset specified.",
    description:
      "It creates a new datablock for the dataset specified by the pid passed.<br>This endpoint is obsolete and will be dropped in future versions.<br>Creating new datablock will be allowed only from the datablocks endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset we would like to create a new datablock for",
    type: String,
  })
  @ApiExtraModels(CreateDatasetDatablockDto)
  @ApiBody({
    type: CreateDatasetDatablockDto,
  })
  @ApiResponse({
    status: 201,
    type: Datablock,
    description: "It returns the new datablock created",
  })
  async createDatablock(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Body() createDatablockDto: CreateDatasetDatablockDto,
  ): Promise<Datablock | null> {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetDatablockCreate,
    );

    if (dataset) {
      const createDatablock: CreateDatablockDto = {
        ...createDatablockDto,
        datasetId: pid,
        ownerGroup: dataset.ownerGroup,
        accessGroups: dataset.accessGroups,
        instrumentGroup: dataset.instrumentGroup,
      };
      const datablock = await this.datablocksService.create(createDatablock);
      await this.datasetsService.findByIdAndUpdate(pid, {
        packedSize: (dataset.packedSize ?? 0) + datablock.packedSize,
        numberOfFilesArchived:
          dataset.numberOfFilesArchived + datablock.dataFileList.length,
        size: dataset.size + datablock.size,
        numberOfFiles: dataset.numberOfFiles + datablock.dataFileList.length,
      });
      return datablock;
    }
    return null;
  }

  // GET /datasets/:id/datablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetDatablockRead, DatasetClass),
  )
  @Get("/:pid/datablocks")
  @ApiOperation({
    summary: "It returns all the datablock for the dataset specified.",
    description:
      "It returns all the datablocks for the dataset specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset for which we would like to retrieve all the datablocks",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Datablock,
    isArray: true,
    description:
      "Array with all the datablocks associated with the dataset with the pid specified",
  })
  async findAllDatablocks(
    @Req() request: Request,
    @Param("pid") pid: string,
  ): Promise<Datablock[]> {
    await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetDatablockRead,
    );

    return this.datablocksService.findAll({ datasetId: pid });
  }

  // PATCH /datasets/:id/datablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetDatablockUpdate, DatasetClass),
  )
  @UseInterceptors(
    new MultiUTCTimeInterceptor<Datablock, DataFile>("dataFileList", ["time"]),
  )
  @Patch("/:pid/datablocks/:did")
  @ApiOperation({
    summary: "It updates the datablocks specified for the dataset indicated.",
    description:
      "It updates the datablock specified by the did parameter for the dataset indicated by the pid parameter.<br>This endpoint is obsolete and it will removed in future version.<br>Datablock can be updated from the datablocks endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "PErsistent identifier of the dataset for which we would like to update the datablocks specified",
    type: String,
  })
  @ApiParam({
    name: "did",
    description:
      "Identifier of the datablock of this dataset that we would like to patch",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Datablock,
    isArray: false,
    description:
      "Updated values of the datablock with id specified associated with the dataset with the pid specified",
  })
  async findOneDatablockAndUpdate(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Param("did") did: string,
    @Body() updateDatablockDto: PartialUpdateDatablockDto,
  ): Promise<Datablock | null> {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetDatablockUpdate,
    );

    const datablockBeforeUpdate = await this.datablocksService.findOne({
      _id: did,
    });
    if (dataset && datablockBeforeUpdate) {
      const datablock = await this.datablocksService.update(
        { _id: did, pid },
        updateDatablockDto,
      );
      if (datablock) {
        await this.datasetsService.findByIdAndUpdate(pid, {
          packedSize:
            (dataset.packedSize ?? 0) -
            datablockBeforeUpdate.packedSize +
            datablock.packedSize,
          numberOfFilesArchived:
            dataset.numberOfFilesArchived -
            datablockBeforeUpdate.dataFileList.length +
            datablock.dataFileList.length,
        });
        return datablock;
      }
    }
    return null;
  }

  // DELETE /datasets/:id/datablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetDatablockDelete, DatasetClass),
  )
  @Delete("/:pid/datablocks/:did")
  @ApiOperation({
    summary: "It deletes the datablock from the dataset.",
    description:
      "It deletes the datablock from the dataset.<br>This endpoint is obsolete and will be dropped in future versions.<br>Deleting datablocks will be done only from the datablocks endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset for which we would like to delete the datablock specified",
    type: String,
  })
  @ApiParam({
    name: "did",
    description:
      "Identifier of the datablock of this dataset that we would like to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned",
  })
  async findOneDatablockAndRemove(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Param("did") did: string,
  ): Promise<unknown> {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetDatablockDelete,
    );

    if (dataset) {
      // remove datablock
      const res = await this.datablocksService.remove({
        _id: did,
        datasetId: pid,
      });
      // all the remaining datablocks for this dataset
      const remainingDatablocks = await this.datablocksService.findAll({
        datasetId: pid,
      });
      // update dataset size and files number
      const updateDatasetDto: PartialUpdateDatasetDto = {
        packedSize: remainingDatablocks.reduce((a, b) => a + b.packedSize, 0),
        numberOfFilesArchived: remainingDatablocks.reduce(
          (a, b) => a + b.dataFileList.length,
          0,
        ),
        size: remainingDatablocks.reduce((a, b) => a + b.size, 0),
        numberOfFiles: remainingDatablocks.reduce(
          (a, b) => a + b.dataFileList.length,
          0,
        ),
      };
      await this.datasetsService.findByIdAndUpdate(
        dataset.pid,
        updateDatasetDto,
      );
      return res;
    }
    return null;
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.DatasetLogbookRead, DatasetClass),
  )
  @Get("/:pid/logbook")
  @ApiOperation({
    summary: "Retrive logbook associated with dataset.",
    description: "It fetches specific logbook based on dataset pid.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Persistent identifier of the dataset for which we would like to delete the datablock specified",
    type: String,
  })
  @ApiResponse({
    status: 200,
    // type: Logbook,
    isArray: false,
    description: "It returns all messages from specificied Logbook room",
  })
  async findLogbookByPid(
    @Req() request: Request,
    @Param("pid") pid: string,
    @Query("filters") filters: string,
  ) {
    const dataset = await this.checkPermissionsForDatasetExtended(
      request,
      pid,
      Action.DatasetLogbookRead,
    );

    const proposalId = dataset?.proposalId;

    if (!proposalId) return null;

    const result = await this.logbooksService.findByName(proposalId, filters);
    return result;
  }
}
