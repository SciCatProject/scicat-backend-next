import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Put,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  Logger,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { DatasetsService } from "./datasets.service";
import { CreateDatasetDto } from "./dto/create-dataset.dto";
import { UpdateDatasetDto } from "./dto/update-dataset.dto";
import { Dataset, DatasetDocument } from "./schemas/dataset.schema";
import { CreateRawDatasetDto } from "./dto/create-raw-dataset.dto";
import { CreateDerivedDatasetDto } from "./dto/create-derived-dataset.dto";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import {
  IDatasetFacets,
  IDatasetFilters,
} from "./interfaces/dataset-filters.interface";
import { PublicDatasetsInterceptor } from "./interceptors/public-datasets.interceptor";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { AttachmentsService } from "src/attachments/attachments.service";
import { UpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";
import { OrigDatablock } from "src/origdatablocks/schemas/origdatablock.schema";
import { CreateOrigdatablockDto } from "src/origdatablocks/dto/create-origdatablock.dto";
import { OrigdatablocksService } from "src/origdatablocks/origdatablocks.service";
import { UpdateOrigdatablockDto } from "src/origdatablocks/dto/update-origdatablock.dto";
import { DatablocksService } from "src/datablocks/datablocks.service";
import { Datablock } from "src/datablocks/schemas/datablock.schema";
import { CreateDatablockDto } from "src/datablocks/dto/create-datablock.dto";
import { UpdateDatablockDto } from "src/datablocks/dto/update-datablock.dto";
import { FilterQuery, UpdateQuery } from "mongoose";
import { FilterPipe } from "src/common/pipes/filter.pipe";
import { UTCTimeInterceptor } from "src/common/interceptors/utc-time.interceptor";
import { RawDataset } from "./schemas/raw-dataset.schema";
import { DataFile } from "src/common/schemas/datafile.schema";
import { MultiUTCTimeInterceptor } from "src/common/interceptors/multi-utc-time.interceptor";
import { FullQueryInterceptor } from "./interceptors/fullquery.interceptor";

@ApiBearerAuth()
@ApiExtraModels(
  CreateAttachmentDto,
  CreateDerivedDatasetDto,
  CreateRawDatasetDto,
)
@ApiTags("datasets")
@Controller("datasets")
export class DatasetsController {
  constructor(
    private attachmentsService: AttachmentsService,
    private datablocksService: DatablocksService,
    private datasetsService: DatasetsService,
    private origDatablocksService: OrigdatablocksService,
  ) {}

  // POST /datasets
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Dataset))
  @UseInterceptors(
    new UTCTimeInterceptor<Dataset>(["creationTime"]),
    new UTCTimeInterceptor<RawDataset>(["endTime"]),
  )
  @Post()
  async create(@Body() createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    return this.datasetsService.create(createDatasetDto);
  }

  // GET /datasets
  @AllowAny()
  @UseInterceptors(PublicDatasetsInterceptor)
  @Get()
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieve all datasets",
    required: false,
  })
  async findAll(
    @Query(new FilterPipe()) filter?: { filter: string; fields: string },
  ): Promise<Dataset[] | null> {
    const jsonFilters: IDatasetFilters =
      filter && filter.filter ? JSON.parse(filter.filter) : {};
    const jsonFields: FilterQuery<DatasetDocument> =
      filter && filter.fields ? JSON.parse(filter.fields) : {};
    const whereFilters: FilterQuery<DatasetDocument> =
      jsonFilters && jsonFilters.where
        ? {
            ...jsonFilters.where,
            ...jsonFields,
          }
        : {
            ...jsonFields,
          };
    const datasetFilters: IDatasetFilters = {
      where: whereFilters,
    };
    if (jsonFilters && jsonFilters.limits) {
      datasetFilters.limits = jsonFilters.limits;
    }
    const datasets = await this.datasetsService.findAll(datasetFilters);
    if (datasets && datasets.length > 0) {
      const includeFilters =
        jsonFilters && jsonFilters.include ? jsonFilters.include : [];
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

  // GET /fullquery
  @AllowAny()
  @UseInterceptors(PublicDatasetsInterceptor, FullQueryInterceptor)
  @Get("/fullquery")
  @ApiQuery({
    name: "filters",
    description: "Database filter to apply when retrieve all datasets",
    required: false,
  })
  async fullquery(
    @Query() filters: { fields?: string; limits?: string },
  ): Promise<Dataset[] | null> {
    const parsedFilters: IDatasetFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.datasetsService.fullquery(parsedFilters);
  }

  // GET /fullfacets
  @AllowAny()
  @UseInterceptors(PublicDatasetsInterceptor)
  @Get("/fullfacet")
  @ApiQuery({
    name: "filters",
    description: "Database filter to apply when retrieve all datasets",
    required: false,
  })
  async fullfacet(
    @Query() filters: { fields?: string; facets?: string },
  ): Promise<Record<string, unknown>[]> {
    const parsedFilters: IDatasetFacets = {
      fields: JSON.parse(filters.fields ?? "{}"),
      facets: JSON.parse(filters.facets ?? "[]"),
    };
    return this.datasetsService.fullFacet(parsedFilters);
  }

  // GET /datasets/metadataKeys
  @AllowAny()
  @UseInterceptors(PublicDatasetsInterceptor)
  @Get("/metadataKeys")
  @ApiQuery({
    name: "filters",
    description: "Database filter to apply when retrieve all metadata keys",
    required: false,
  })
  async metadataKeys(
    @Query("fields") filters: { fields?: string; limits?: string },
  ): Promise<string[]> {
    const parsedFilters: IDatasetFilters = {
      fields: JSON.parse(filters.fields ?? "{}"),
      limits: JSON.parse(filters.limits ?? "{}"),
    };
    return this.datasetsService.metadataKeys(parsedFilters);
  }

  // GET /datasets/findOne
  @AllowAny()
  @Get("/findOne")
  @ApiQuery({
    name: "filter",
    description: "Database filter to apply when finding a Dataset",
    required: false,
  })
  async findOne(@Query("filter") filters?: string): Promise<Dataset | null> {
    const jsonFilters: IDatasetFilters = filters ? JSON.parse(filters) : {};
    const whereFilters = jsonFilters.where ?? {};
    const dataset = await this.datasetsService.findOne(whereFilters);
    if (dataset) {
      const includeFilters = jsonFilters.include ?? [];
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
                { datasetId: dataset.pid },
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

  // GET /count
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Dataset))
  @Get("/count")
  async count(
    @Query("where") where: FilterQuery<DatasetDocument>,
  ): Promise<{ count: number }> {
    return this.datasetsService.count(where);
  }

  // GET /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Dataset))
  @Get("/:id")
  async findById(@Param("id") id: string): Promise<Dataset | null> {
    Logger.log("Finding dataset with pid : " + id);
    return this.datasetsService.findOne({ pid: id });
  }

  // PATCH /datasets/:id
  // body: modified fields
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Dataset))
  @UseInterceptors(
    new UTCTimeInterceptor<Dataset>(["creationTime"]),
    new UTCTimeInterceptor<RawDataset>(["endTime"]),
  )
  @Patch("/:id")
  async findByIdAndUpdate(
    @Param("id") id: string,
    @Body()
    updateDatasetDto: UpdateDatasetDto,
  ): Promise<Dataset | null> {
    return this.datasetsService.findByIdAndUpdate(id, updateDatasetDto);
  }

  // PUT /datasets/:id
  // body: full dataset model
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Dataset))
  @Put("/:id")
  async findByIdReplaceOrCreate(
    @Param("id") id: string,
    @Body()
    createDatasetDto: CreateDatasetDto,
  ): Promise<Dataset> {
    return this.datasetsService.findByIdAndReplaceOrCreate(
      id,
      createDatasetDto,
    );
  }

  // DELETE /datasets/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Dataset))
  @Delete("/:id")
  async findByIdAndDelete(@Param("id") id: string): Promise<unknown> {
    return this.datasetsService.findByIdAndDelete(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Dataset))
  @Post("/:id/appendToArrayField")
  async appendToArrayField(
    @Param("id") id: string,
    @Query("fieldName") fieldName: string,
    data: unknown[],
  ): Promise<Dataset | null> {
    // $addToSet is necessary to append to the field and not overwrite
    // $each is necessary as data is an array of values
    const updateQuery: UpdateQuery<DatasetDocument> = {
      $addToSet: {
        [fieldName]: { $each: data },
      },
    };

    return this.datasetsService.findByIdAndUpdate(id, updateQuery);
  }

  // GET /datasets/:id/thumbnail
  @AllowAny()
  @Get("/:id/thumbnail")
  async thumbnail(@Param("id") id: string): Promise<Partial<Attachment>> {
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
  @Post("/:id/attachments")
  async createAttachment(
    @Param("id") id: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment | null> {
    const dataset = await this.datasetsService.findOne({ pid: id });
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
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:id/attachments")
  async findAllAttachments(@Param("id") id: string): Promise<Attachment[]> {
    return this.attachmentsService.findAll({ datasetId: id });
  }

  // PATCH /datasets/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Attachment),
  )
  @Patch("/:id/attachments/:fk")
  async findOneAttachmentAndUpdate(
    @Param("id") datasetId: string,
    @Param("fk") attachmentId: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    return this.attachmentsService.findOneAndUpdate(
      { _id: attachmentId, datasetId },
      updateAttachmentDto,
    );
  }

  // DELETE /datasets/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Attachment),
  )
  @Delete("/:id/attachments/:fk")
  async findOneAttachmentAndRemove(
    @Param("id") datasetId: string,
    @Param("fk") attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      datasetId,
    });
  }

  // POST /datasets/:id/origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, OrigDatablock),
  )
  @UseInterceptors(
    new MultiUTCTimeInterceptor<OrigDatablock, DataFile>("dataFileList", [
      "time",
    ]),
  )
  @Post("/:id/origdatablocks")
  async createOrigDatablock(
    @Param("id") id: string,
    @Body() createOrigdatablockDto: CreateOrigdatablockDto,
  ): Promise<OrigDatablock | null> {
    const dataset = await this.datasetsService.findOne({ pid: id });
    if (dataset) {
      const createOrigDatablock: CreateOrigdatablockDto = {
        ...createOrigdatablockDto,
        datasetId: id,
        ownerGroup: dataset.ownerGroup,
      };
      return this.origDatablocksService.create(createOrigDatablock);
    }
    return null;
  }

  // GET /datasets/:id/origdatablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, OrigDatablock),
  )
  @Get("/:id/origdatablocks")
  async findAllOrigDatablocks(
    @Param("id") id: string,
  ): Promise<OrigDatablock[]> {
    return this.origDatablocksService.findAll({ datasetId: id });
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
  @Patch("/:id/origdatablocks/:fk")
  async findOneOrigDatablockAndUpdate(
    @Param("id") datasetId: string,
    @Param("fk") origDatablockId: string,
    @Body() updateOrigdatablockDto: UpdateOrigdatablockDto,
  ): Promise<OrigDatablock | null> {
    return this.origDatablocksService.update(
      { _id: origDatablockId, datasetId },
      updateOrigdatablockDto,
    );
  }

  // DELETE /datasets/:id/origdatablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, OrigDatablock),
  )
  @Delete("/:id/origdatablocks/:fk")
  async findOneOrigDatablockAndRemove(
    @Param("id") datasetId: string,
    @Param("fk") origDatablockId: string,
  ): Promise<unknown> {
    return this.origDatablocksService.remove({
      _id: origDatablockId,
      datasetId,
    });
  }

  // POST /datasets/:id/datablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Datablock))
  @UseInterceptors(
    new MultiUTCTimeInterceptor<Datablock, DataFile>("dataFileList", ["time"]),
  )
  @Post("/:id/datablocks")
  async createDatablock(
    @Param("id") id: string,
    @Body() createDatablockDto: CreateDatablockDto,
  ): Promise<Datablock | null> {
    const dataset = await this.datasetsService.findOne({ pid: id });
    if (dataset) {
      const createDatablock: CreateDatablockDto = {
        ...createDatablockDto,
        datasetId: id,
        ownerGroup: dataset.ownerGroup,
      };
      const datablock = await this.datablocksService.create(createDatablock);
      await this.datasetsService.findByIdAndUpdate(id, {
        packedSize: datablock.packedSize,
        numberOfFilesArchived: datablock.dataFileList.length,
      });
      return datablock;
    }
    return null;
  }

  // GET /datasets/:id/datablocks
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Datablock))
  @Get("/:id/datablocks")
  async findAllDatablocks(@Param("id") id: string): Promise<Datablock[]> {
    return this.datablocksService.findAll({ datasetId: id });
  }

  // PATCH /datasets/:id/datablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Datablock))
  @UseInterceptors(
    new MultiUTCTimeInterceptor<Datablock, DataFile>("dataFileList", ["time"]),
  )
  @Patch("/:id/datablocks/:fk")
  async findOneDatablockAndUpdate(
    @Param("id") datasetId: string,
    @Param("fk") datablockId: string,
    @Body() updateDatablockDto: UpdateDatablockDto,
  ): Promise<Datablock | null> {
    const datablock = await this.datablocksService.update(
      { _id: datablockId, datasetId },
      updateDatablockDto,
    );
    if (datablock) {
      await this.datasetsService.findByIdAndUpdate(datasetId, {
        packedSize: datablock.packedSize,
        numberOfFilesArchived: datablock.dataFileList.length,
      });
      return datablock;
    }
    return null;
  }

  // DELETE /datasets/:id/datablocks/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Datablock))
  @Delete("/:id/datablocks/:fk")
  async findOneDatablockAndRemove(
    @Param("id") datasetId: string,
    @Param("fk") datablockId: string,
  ): Promise<unknown> {
    return this.datablocksService.remove({
      _id: datablockId,
      datasetId,
    });
  }
}
