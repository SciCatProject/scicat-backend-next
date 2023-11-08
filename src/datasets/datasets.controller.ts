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
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
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
import { UpdateDatablockDto } from "src/datablocks/dto/update-datablock.dto";
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
import { TechniqueClass } from "./schemas/technique.schema";
import { RelationshipClass } from "./schemas/relationship.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { Logbook } from "src/logbooks/schemas/logbook.schema";

@ApiBearerAuth()
@ApiExtraModels(
  CreateAttachmentDto,
  CreateDerivedDatasetDto,
  CreateRawDatasetDto,
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

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, DatasetClass);
      const canViewTheirOwn = ability.can(Action.ListOwn, DatasetClass);
      if (!canViewAll && canViewTheirOwn) {
        if (!mergedFilters.where) {
          mergedFilters.where = {};
        }
        mergedFilters.where["$or"] = [
          { ownerGroup: { $in: user.currentGroups } },
          { accessGroups: { $in: user.currentGroups } },
          { isPublished: true },
        ];
      }
    }

    return mergedFilters;
  }

  async checkPermissionsForDataset(request: Request, id: string) {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    const user: JWTUser = request.user as JWTUser;

    if (dataset) {
      // NOTE: We need DatasetClass instance because casl module can not recognize the type from dataset mongo database model. If other fields are needed can be added later.
      const datasetInstance = new DatasetClass();
      datasetInstance._id = dataset._id;
      datasetInstance.pid = dataset.pid;
      datasetInstance.accessGroups = dataset.accessGroups || [];
      datasetInstance.ownerGroup = dataset.ownerGroup;
      datasetInstance.sharedWith = dataset.sharedWith;
      datasetInstance.isPublished = dataset.isPublished || false;
      datasetInstance.owner = dataset.owner;
      datasetInstance.ownerEmail = dataset.ownerEmail;
      if (user) {
        const ability = this.caslAbilityFactory.createForUser(user);
        const canView =
          ability.can(Action.Manage, datasetInstance) ||
          ability.can(Action.Read, datasetInstance);
        if (!canView && !dataset.isPublished) {
          throw new ForbiddenException("Unauthorized access");
        }
      } else if (!dataset.isPublished) {
        throw new ForbiddenException("Unauthorized access");
      }
    }

    return dataset;
  }

  getUserPermissionsFromGroups(user: JWTUser) {
    const createDatasetWithPidGroupsString =
      process.env.CREATE_DATASET_WITH_PID_GROUPS || "";
    const createDatasetWithPidGroups: string[] =
      createDatasetWithPidGroupsString
        ? createDatasetWithPidGroupsString.split(",").map((v) => v.trim())
        : [];

    const stringAdminGroups = process.env.ADMIN_GROUPS || "";
    const adminGroups: string[] = stringAdminGroups
      ? stringAdminGroups.split(",").map((v) => v.trim())
      : [];

    const isPartOfAdminGroups = user.currentGroups.some((g) =>
      adminGroups.includes(g),
    );
    const userCanCreateDatasetWithPid = createDatasetWithPidGroups.some(
      (value) => user.currentGroups.includes(value),
    );

    return {
      isPartOfAdminGroups,
      userCanCreateDatasetWithPid,
    };
  }

  async checkPermissionsForDatasetCreate(
    request: Request,
    dataset: CreateRawDatasetDto | CreateDerivedDatasetDto,
  ) {
    const user: JWTUser = request.user as JWTUser;

    if (dataset) {
      // NOTE: We need DatasetClass instance because casl module can not recognize the type from dataset mongo database model. If other fields are needed can be added later.
      const datasetInstance = new DatasetClass();
      datasetInstance._id = "";
      datasetInstance.pid = dataset.pid || "";
      datasetInstance.accessGroups = dataset.accessGroups || [];
      datasetInstance.ownerGroup = dataset.ownerGroup;
      datasetInstance.sharedWith = dataset.sharedWith;
      datasetInstance.isPublished = dataset.isPublished || false;
      datasetInstance.owner = dataset.owner;
      datasetInstance.ownerEmail = dataset.ownerEmail;
      if (user) {
        const { isPartOfAdminGroups, userCanCreateDatasetWithPid } =
          this.getUserPermissionsFromGroups(user);
        if (
          datasetInstance.pid &&
          !userCanCreateDatasetWithPid &&
          !isPartOfAdminGroups
        ) {
          throw new ForbiddenException(
            "Unauthorized to create datasets with explicit PID",
          );
        } else {
          // NOTE: If it can create dataset but not part of ADMIN_GROUPS and not part of CREATE_DATASET_WITH_PID_GROUPS,
          // then we make sure that pid is not provided by user but it is generated by the system.
          if (!isPartOfAdminGroups && !userCanCreateDatasetWithPid) {
            delete dataset.pid;
          }

          const ability = this.caslAbilityFactory.createForUser(user);
          const canCreate = ability.can(Action.Create, datasetInstance);

          if (!canCreate) {
            throw new ForbiddenException("Unauthorized to create this dataset");
          }

          const datasetCreationValidationEnabled =
            process.env.DATASET_CREATION_VALIDATION_ENABLED;

          const datasetCreationValidationRegex =
            process.env.DATASET_CREATION_VALIDATION_REGEX;

          if (
            datasetCreationValidationEnabled &&
            datasetCreationValidationRegex &&
            dataset.pid
          ) {
            const re = new RegExp(datasetCreationValidationRegex);

            if (!re.test(dataset.pid)) {
              throw new BadRequestException(
                "PID is not following required standards",
              );
            }
          }
        }
      } else {
        throw new ForbiddenException("Unauthorized to create datasets");
      }
    }

    return dataset;
  }

  // POST /datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, DatasetClass),
  )
  @UseInterceptors(
    new UTCTimeInterceptor<DatasetClass>(["creationTime"]),
    new UTCTimeInterceptor<DatasetClass>(["endTime"]),
    new FormatPhysicalQuantitiesInterceptor<DatasetClass>("scientificMetadata"),
  )
  @HttpCode(HttpStatus.OK)
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
    const type = inputDatasetDto.type;
    const validateOptions: ValidatorOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: {
        value: false,
        target: false,
      },
    };

    if (type !== "raw" && type !== "derived") {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Wrong dataset type!",
        },
        HttpStatus.BAD_REQUEST,
      );
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

  @UseInterceptors(
    new UTCTimeInterceptor<DatasetClass>(["creationTime"]),
    new UTCTimeInterceptor<DatasetClass>(["endTime"]),
    new FormatPhysicalQuantitiesInterceptor<DatasetClass>("scientificMetadata"),
  )
  @AllowAny()
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
  async isValid(@Body() createDataset: unknown): Promise<{ valid: boolean }> {
    const dtoTestRawCorrect = plainToInstance(
      CreateRawDatasetDto,
      createDataset,
    );
    const errorsTestRawCorrect = await validate(dtoTestRawCorrect);

    const dtoTestDerivedCorrect = plainToInstance(
      CreateDerivedDatasetDto,
      createDataset,
    );
    const errorsTestDerivedCorrect = await validate(dtoTestDerivedCorrect);

    const valid =
      errorsTestRawCorrect.length == 0 || errorsTestDerivedCorrect.length == 0;

    return { valid: valid };
  }

  // GET /datasets
  @AllowAny()
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
  @AllowAny()
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
    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, DatasetClass);

      // NOTE: If we have published true we don't add groups at all
      if (!canViewAll && !fields.isPublished) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
        fields.sharedWith = user.email;
      }
    }

    const parsedFilters: IFilters<DatasetDocument, IDatasetFields> = {
      fields: fields,
      limits: JSON.parse(filters.limits ?? "{}"),
    };

    return this.datasetsService.fullquery(parsedFilters);
  }

  // GET /fullfacets
  @AllowAny()
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

    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, DatasetClass);

      // NOTE: If we have published true we don't add groups at all
      if (!canViewAll && !fields.isPublished) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }

    const parsedFilters: IFacets<IDatasetFields> = {
      fields: fields,
      facets: JSON.parse(filters.facets ?? "[]"),
    };
    return this.datasetsService.fullFacet(parsedFilters);
  }

  // GET /datasets/metadataKeys
  @AllowAny()
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
    if (user) {
      const ability = this.caslAbilityFactory.createForUser(user);
      const canViewAll = ability.can(Action.ListAll, DatasetClass);
      if (!canViewAll && !fields.isPublished) {
        fields.userGroups = fields.userGroups ?? [];
        fields.userGroups.push(...user.currentGroups);
      }
    }

    const parsedFilters: IFilters<DatasetDocument, IDatasetFields> = {
      fields: fields,
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.datasetsService.metadataKeys(parsedFilters);
  }

  // GET /datasets/findOne
  @AllowAny()
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

    const dataset = await this.datasetsService.findOne(mergedFilters);
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
    ability.can(Action.Read, DatasetClass),
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
  @AllowAny()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, DatasetClass),
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
    ability.can(Action.Update, DatasetClass),
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

    // NOTE: Type is a must have because validation is based on it
    const datasetType = updateDatasetDto.type ?? foundDataset.type;

    // NOTE: Default validation pipe does not validate union types. So we need custom validation.
    await this.validateDataset(
      { ...updateDatasetDto, type: datasetType },
      datasetType === "raw"
        ? PartialUpdateRawDatasetDto
        : PartialUpdateDerivedDatasetDto,
    );

    return this.datasetsService.findByIdAndUpdate(pid, updateDatasetDto);
  }

  // PUT /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, DatasetClass),
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
    @Param("pid") id: string,
    @Body() updateDatasetDto: UpdateRawDatasetDto | UpdateDerivedDatasetDto,
  ): Promise<DatasetClass | null> {
    // NOTE: Default validation pipe does not validate union types. So we need custom validation.
    const outputDto = await this.validateDataset(
      updateDatasetDto,
      updateDatasetDto.type === "raw"
        ? UpdateRawDatasetDto
        : UpdateDerivedDatasetDto,
    );

    return this.datasetsService.findByIdAndReplace(
      id,
      outputDto as UpdateRawDatasetDto | UpdateDerivedDatasetDto,
    );
  }

  // DELETE /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, DatasetClass),
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
  async findByIdAndDelete(@Param("pid") id: string): Promise<unknown> {
    return this.datasetsService.findByIdAndDelete(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, DatasetClass),
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
    @Param("pid") id: string,
    @Query("fieldName") fieldName: string,
    @Query("data") data: string,
  ): Promise<DatasetClass | null> {
    const loggedInUser: JWTUser = request.user as JWTUser;
    const ability = this.caslAbilityFactory.createForUser(loggedInUser);
    const datasetToUpdate = await this.datasetsService.findOne({
      where: { pid: id },
    });

    if (!datasetToUpdate) {
      throw new NotFoundException();
    }

    const datasetInstance = new DatasetClass();
    datasetInstance._id = datasetToUpdate._id;
    datasetInstance.pid = datasetToUpdate.pid;
    datasetInstance.accessGroups = datasetToUpdate.accessGroups || [];
    datasetInstance.ownerGroup = datasetToUpdate.ownerGroup;
    datasetInstance.sharedWith = datasetToUpdate.sharedWith;
    datasetInstance.isPublished = datasetToUpdate.isPublished || false;
    datasetInstance.owner = datasetToUpdate.owner;
    datasetInstance.ownerEmail = datasetToUpdate.ownerEmail;

    const canUpdate = ability.can(Action.Update, datasetInstance);

    if (!canUpdate) {
      throw new ForbiddenException();
    }

    const parsedData = JSON.parse(data);

    const updateQuery: UpdateQuery<DatasetDocument> = {
      $addToSet: {
        [fieldName]: { $each: parsedData },
      },
    };

    return this.datasetsService.findByIdAndUpdate(id, updateQuery);
  }

  // GET /datasets/:id/thumbnail
  @AllowAny()
  // @UseGuards(PoliciesGuard)
  @Get("/:pid/thumbnail")
  @ApiOperation({
    summary: "It returns the thumbnail associated with the dataset.",
    description:
      "It returns the thumbnail associated with the dataset with the provided pid.",
  })
  @ApiParam({
    name: "pid",
    description: "Id of the dataset",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Attachment,
    description: "Return new value of the dataset",
  })
  async thumbnail(
    @Req() request: Request,
    @Param("pid") id: string,
  ): Promise<Partial<Attachment>> {
    await this.checkPermissionsForDataset(request, id);

    const attachment = await this.attachmentsService.findOne(
      { datasetId: id },
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
    ability.can(Action.Create, Attachment),
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
      "Id of the dataset we would like to create a new attachment for",
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
    @Param("pid") id: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment | null> {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    if (dataset) {
      const createAttachment: CreateAttachmentDto = {
        ...createAttachmentDto,
        datasetId: id,
        ownerGroup: dataset.ownerGroup,
      };
      return this.attachmentsService.create(createAttachment);
    }
    return null;
  }

  // GET /datasets/:id/attachments
  // @UseGuards(PoliciesGuard)
  @AllowAny()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:pid/attachments")
  @ApiOperation({
    summary: "It returns all the attachments for the dataset specified.",
    description:
      "It returns all the attachments for the dataset specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the dataset for which we would like to retrieve all the attachments",
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
    @Param("pid") id: string,
  ): Promise<Attachment[]> {
    await this.checkPermissionsForDataset(request, id);

    return this.attachmentsService.findAll({ datasetId: id });
  }

  // PATCH /datasets/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Attachment),
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
      "Id of the dataset for which we would like to update the attachment specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Id of the attachment of this dataset that we would like to patch",
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: Attachment,
    isArray: false,
    description: "Returns the attachment updated.",
  })
  async findOneAttachmentAndUpdate(
    @Param("pid") datasetId: string,
    @Param("aid") attachmentId: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    return this.attachmentsService.findOneAndUpdate(
      { _id: attachmentId, datasetId: datasetId },
      updateAttachmentDto,
    );
  }

  // DELETE /datasets/:pid/attachments/:aid
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Attachment),
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
      "Id of the dataset for which we would like to delete the attachment specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Id of the attachment of this dataset that we would like to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned.",
  })
  async findOneAttachmentAndRemove(
    @Param("pid") datasetId: string,
    @Param("aid") attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      datasetId,
    });
  }

  // POST /datasets/:id/origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => {
    return ability.can(Action.Create, OrigDatablock);
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
      "Id of the dataset we would like to create a new original datablock for",
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
    @Param("pid") id: string,
    @Body() createDatasetOrigDatablockDto: CreateDatasetOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    if (dataset) {
      const createOrigDatablock: CreateOrigDatablockDto = {
        ...createDatasetOrigDatablockDto,
        datasetId: id,
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
  @AllowAny()
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
      "Id of the dataset we would like to create a new original datablock for",
    type: String,
  })
  @ApiExtraModels(CreateDatasetOrigDatablockDto)
  @ApiBody({
    type: CreateDatasetOrigDatablockDto,
  })
  @ApiResponse({
    status: 201,
    description:
      "IT returns true if the values passed in are a valid original datablock",
  })
  async origDatablockIsValid(
    @Body() createOrigDatablock: unknown,
  ): Promise<{ valid: boolean; errors: ValidationError[] }> {
    const dtoTestOrigDatablock = plainToInstance(
      CreateDatasetOrigDatablockDto,
      createOrigDatablock,
    );
    const errorsTestOrigDatablock = await validate(dtoTestOrigDatablock);

    const valid = errorsTestOrigDatablock.length == 0;

    return { valid: valid, errors: errorsTestOrigDatablock };
  }

  // GET /datasets/:id/origdatablocks
  @AllowAny()
  // @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/:pid/origdatablocks")
  @ApiOperation({
    summary: "It returns all the origDatablock for the dataset specified.",
    description:
      "It returns all the original datablocks for the dataset specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the dataset for which we would like to retrieve all the original datablocks",
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
    @Param("pid") id: string,
  ): Promise<OrigDatablock[]> {
    await this.checkPermissionsForDataset(request, id);

    return this.origDatablocksService.findAll({ where: { datasetId: id } });
  }

  // PATCH /datasets/:id/origdatablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, OrigDatablock),
  )
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
      "Id of the dataset for which we would like to update the original datablocks specified",
    type: String,
  })
  @ApiParam({
    name: "oid",
    description:
      "Id of the original datablock of this dataset that we would like to patch",
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
    @Param("pid") datasetId: string,
    @Param("oid") origDatablockId: string,
    @Body() updateOrigdatablockDto: UpdateOrigDatablockDto,
  ): Promise<OrigDatablock | null> {
    const dataset = await this.datasetsService.findOne({
      where: { pid: datasetId },
    });
    const origDatablockBeforeUpdate = await this.origDatablocksService.findOne({
      _id: origDatablockId,
    });
    if (dataset && origDatablockBeforeUpdate) {
      const origDatablock = await this.origDatablocksService.update(
        { _id: origDatablockId, datasetId },
        updateOrigdatablockDto,
      );
      if (origDatablock) {
        await this.datasetsService.findByIdAndUpdate(datasetId, {
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
    ability.can(Action.Delete, OrigDatablock),
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
      "Id of the dataset for which we would like to delete the original datablock specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Id of the original datablock of this dataset that we would like to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned",
  })
  async findOneOrigDatablockAndRemove(
    @Param("pid") datasetId: string,
    @Param("oid") origDatablockId: string,
  ): Promise<unknown> {
    const dataset = await this.datasetsService.findOne({
      where: { pid: datasetId },
    });
    if (dataset) {
      // remove origdatablock
      const res = await this.origDatablocksService.remove({
        _id: origDatablockId,
        datasetId,
      });
      // all the remaing orig datablocks for this dataset
      const odb = await this.origDatablocksService.findAll({
        where: { datasetId: datasetId },
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Datablock))
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
      "Id of the dataset we would like to create a new datablock for",
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
    @Param("pid") id: string,
    @Body() createDatablockDto: CreateDatasetDatablockDto,
  ): Promise<Datablock | null> {
    const dataset = await this.datasetsService.findOne({ where: { pid: id } });
    if (dataset) {
      const createDatablock: CreateDatablockDto = {
        ...createDatablockDto,
        datasetId: id,
        ownerGroup: dataset.ownerGroup,
        accessGroups: dataset.accessGroups,
        instrumentGroup: dataset.instrumentGroup,
      };
      const datablock = await this.datablocksService.create(createDatablock);
      await this.datasetsService.findByIdAndUpdate(id, {
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
  @AllowAny()
  // @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Datablock))
  @Get("/:pid/datablocks")
  @ApiOperation({
    summary: "It returns all the datablock for the dataset specified.",
    description:
      "It returns all the datablocks for the dataset specified by the pid passed.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the dataset for which we would like to retrieve all the datablocks",
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
    @Param("pid") id: string,
  ): Promise<Datablock[]> {
    await this.checkPermissionsForDataset(request, id);

    return this.datablocksService.findAll({ datasetId: id });
  }

  // PATCH /datasets/:id/datablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Datablock))
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
      "Id of the dataset for which we would like to update the datablocks specified",
    type: String,
  })
  @ApiParam({
    name: "oid",
    description:
      "Id of the datablock of this dataset that we would like to patch",
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
    @Param("pid") datasetId: string,
    @Param("did") datablockId: string,
    @Body() updateDatablockDto: UpdateDatablockDto,
  ): Promise<Datablock | null> {
    const dataset = await this.datasetsService.findOne({
      where: { pid: datasetId },
    });
    const datablockBeforeUpdate = await this.datablocksService.findOne({
      _id: datablockId,
    });
    if (dataset && datablockBeforeUpdate) {
      const datablock = await this.datablocksService.update(
        { _id: datablockId, datasetId },
        updateDatablockDto,
      );
      if (datablock) {
        await this.datasetsService.findByIdAndUpdate(datasetId, {
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Datablock))
  @Delete("/:pid/datablocks/:did")
  @ApiOperation({
    summary: "It deletes the datablock from the dataset.",
    description:
      "It deletes the datablock from the dataset.<br>This endpoint is obsolete and will be dropped in future versions.<br>Deleting datablocks will be done only from the datablocks endpoint.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the dataset for which we would like to delete the datablock specified",
    type: String,
  })
  @ApiParam({
    name: "aid",
    description:
      "Id of the datablock of this dataset that we would like to delete",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "No value is returned",
  })
  async findOneDatablockAndRemove(
    @Param("pid") datasetId: string,
    @Param("did") datablockId: string,
  ): Promise<unknown> {
    const dataset = await this.datasetsService.findOne({
      where: { pid: datasetId },
    });
    if (dataset) {
      // remove datablock
      const res = await this.datablocksService.remove({
        _id: datablockId,
        datasetId,
      });
      // all the remaining datablocks for this dataset
      const remainingDatablocks = await this.datablocksService.findAll({
        datasetId: datasetId,
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
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Logbook))
  @Get("/:pid/logbook")
  @ApiOperation({
    summary: "Retrive logbook associated with dataset.",
    description: "It fetches specific logbook based on dataset pid.",
  })
  @ApiParam({
    name: "pid",
    description:
      "Id of the dataset for which we would like to delete the datablock specified",
    type: String,
  })
  @ApiResponse({
    status: 200,
    // type: Logbook,
    isArray: false,
    description: "It returns all messages from specificied Logbook room",
  })
  async findLogbookByPid(
    @Param("pid") datasetId: string,
    @Query("filters") filters: string,
  ) {
    const dataset = await this.datasetsService.findOne({
      where: { pid: datasetId },
    });
    const proposalId = dataset?.proposalId;

    if (!proposalId) return null;

    const result = await this.logbooksService.findByName(proposalId, filters);
    return result;
  }
}
