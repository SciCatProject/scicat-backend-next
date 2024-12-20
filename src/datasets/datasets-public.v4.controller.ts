import { Controller, Get, Param, Query, HttpStatus } from "@nestjs/common";
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DatasetsService } from "./datasets.service";
import { DatasetDocument } from "./schemas/dataset.schema";
import {
  IDatasetFields,
  IDatasetFiltersV4,
} from "./interfaces/dataset-filters.interface";
import { IFilters } from "src/common/interfaces/common.interface";

import { HistoryClass } from "./schemas/history.schema";
import { TechniqueClass } from "./schemas/technique.schema";
import { RelationshipClass } from "./schemas/relationship.schema";
import { OutputDatasetDto } from "./dto/output-dataset.dto";
import { CountApiResponse } from "src/common/types";
import { DatasetLookupKeysEnum } from "./types/dataset-lookup";
import { IncludeValidationPipe } from "./pipes/include-validation.pipe";
import { FilterValidationPipe } from "./pipes/filter-validation.pipe";
import { getSwaggerDatasetFilterContent } from "./types/dataset-filter-content";

@ApiExtraModels(HistoryClass, TechniqueClass, RelationshipClass)
@ApiTags("datasets public v4")
@Controller({ path: "datasets/public", version: "4" })
export class DatasetsPublicV4Controller {
  constructor(private datasetsService: DatasetsService) {}

  addPublicFilter(filter: IDatasetFiltersV4<DatasetDocument, IDatasetFields>) {
    if (!filter.where) {
      filter.where = {};
    }

    filter.where = { ...filter.where, isPublished: true };
  }

  // GET /datasets/public
  @Get()
  @ApiOperation({
    summary: "It returns a list of public datasets.",
    description:
      "It returns a list of public datasets. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving the public datasets",
    required: false,
    type: String,
    content: getSwaggerDatasetFilterContent(),
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputDatasetDto,
    isArray: true,
    description: "Return the datasets requested",
  })
  async findAllPublic(
    @Query("filter", new FilterValidationPipe(), new IncludeValidationPipe())
    queryFilter: string,
  ) {
    const parsedFilter = JSON.parse(queryFilter ?? "{}");

    this.addPublicFilter(parsedFilter);

    const datasets = await this.datasetsService.findAllComplete(parsedFilter);

    return datasets;
  }

  // GET /datasets/public/metadataKeys
  @Get("/metadataKeys")
  @ApiOperation({
    summary:
      "It returns a list of metadata keys contained in the public datasets matching the filter provided.",
    description:
      "It returns a list of metadata keys contained in the public datasets matching the filter provided.<br>This endpoint still needs some work on the filter and facets specification.",
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
    status: HttpStatus.OK,
    type: String,
    isArray: true,
    description: "Return metadata keys for list of public datasets selected",
  })
  // NOTE: This one needs to be discussed as well but it gets the metadata keys from the dataset but it doesnt do it with the nested fields. Think about it
  async publicMetadataKeys(
    @Query() filters: { fields?: string; limits?: string },
  ) {
    let fields: IDatasetFields = JSON.parse(filters.fields ?? "{}");

    fields = { ...fields, isPublished: true };

    const parsedFilters: IFilters<DatasetDocument, IDatasetFields> = {
      fields: fields,
      limits: JSON.parse(filters.limits ?? "{}"),
    };

    return this.datasetsService.metadataKeys(parsedFilters);
  }

  // GET /datasets/public/findOne
  @Get("/findOne")
  @ApiOperation({
    summary: "It returns the first public dataset found.",
    description:
      "It returns the first public dataset of the ones that matches the filter provided. The list returned can be modified by providing a filter.",
  })
  @ApiQuery({
    name: "filter",
    description: "Database filters to apply when retrieving public dataset",
    required: true,
    type: String,
    content: getSwaggerDatasetFilterContent({
      where: true,
      include: true,
      fields: true,
      limits: true,
    }),
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputDatasetDto,
    description: "Return the datasets requested",
  })
  async findOnePublic(
    @Query("filter", new FilterValidationPipe(), new IncludeValidationPipe())
    queryFilter: string,
  ): Promise<OutputDatasetDto | null> {
    const parsedFilter = JSON.parse(queryFilter ?? "{}");

    this.addPublicFilter(parsedFilter);

    const foundDataset =
      await this.datasetsService.findOneComplete(parsedFilter);

    if (!foundDataset) {
      // TODO: Do we want to throw here if the dataset is not found!?
      // something like: throw new NotFoundException(`Dataset with provided filters: ${queryFilter} was not found. Please check your filter and try again`);
    }

    return foundDataset;
  }

  // GET /datasets/public/count
  @Get("/count")
  @ApiOperation({
    summary: "It returns the number of public datasets.",
    description:
      "It returns a number of public datasets matching the where filter if provided.",
  })
  @ApiQuery({
    name: "filter",
    description:
      "Database filters to apply when retrieving count for public datasets",
    required: false,
    type: String,
    content: getSwaggerDatasetFilterContent({
      where: true,
      include: false,
      fields: false,
      limits: false,
    }),
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CountApiResponse,
    description:
      "Return the number of public datasets in the following format: { count: integer }",
  })
  async countPublic(
    @Query(
      "filter",
      new FilterValidationPipe({
        where: true,
        include: false,
        fields: false,
        limits: false,
      }),
    )
    queryFilter?: string,
  ) {
    const parsedFilter = JSON.parse(queryFilter ?? "{}");

    this.addPublicFilter(parsedFilter);

    return this.datasetsService.count(parsedFilter);
  }

  // GET /datasets/public/:id
  @Get("/:pid")
  @ApiParam({
    name: "pid",
    description: "Id of the public dataset to return",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutputDatasetDto,
    isArray: false,
    description: "Return public dataset with pid specified",
  })
  @ApiQuery({
    name: "include",
    enum: DatasetLookupKeysEnum,
    type: String,
    required: false,
    isArray: true,
  })
  async findByIdPublic(
    @Param("pid") id: string,
    @Query("include", new IncludeValidationPipe())
    include: DatasetLookupKeysEnum[] | DatasetLookupKeysEnum,
  ) {
    const includeArray = Array.isArray(include)
      ? include
      : include && Array(include);

    const dataset = await this.datasetsService.findOneComplete({
      where: { pid: id, isPublished: true },
      include: includeArray,
    });

    return dataset;
  }
}