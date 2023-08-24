import {
  Controller,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Query,
  Inject,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { DatasetsService } from "src/datasets/datasets.service";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import { SearchDto } from "./dto/search.dto";
import { ElasticSearchService } from "./elastic-search.service";

@ApiBearerAuth()
@ApiTags("elastic-search")
@Controller("elastic-search")
export class ElasticSearchServiceController {
  constructor(
    @Inject(ElasticSearchService)
    private readonly elasticSearchService: ElasticSearchService,
    private readonly datasetsService: DatasetsService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiQuery({
    name: "index",
    required: true,
    type: String,
    example: "dataset",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Create index",
  })
  @Post("/create-index")
  async createIndex(@Query("index") index: string) {
    const esIndex = index.trim();

    return this.elasticSearchService.createIndex(esIndex);
  }

  @HttpCode(HttpStatus.OK)
  @Post("/sync-database")
  @ApiQuery({
    name: "index",
    required: true,
    type: String,
    example: "dataset",
  })
  @ApiResponse({
    status: 200,
    description: "Sync data to the index",
  })
  async syncDatabase(@Query("index") index: string) {
    const esIndex = index.trim();
    const collectionData = await this.datasetsService.getDatasetsWithoutId();

    return this.elasticSearchService.syncDatabase(collectionData, esIndex);
  }

  @HttpCode(HttpStatus.OK)
  @AllowAny()
  @ApiBody({
    type: SearchDto,
  })
  @ApiResponse({
    status: 200,
    description: "Search with elasticsearch to get restuls in PIDs",
  })
  @Post("/search")
  async fetchESResults(@Body() searchDto: IDatasetFields) {
    return this.elasticSearchService.search(searchDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: "index",
    required: true,
    type: String,
    example: "dataset",
  })
  @ApiResponse({
    status: 200,
    description: "Delete index",
  })
  @Post("/delete-index")
  async deleteIndex(@Query("index") index: string) {
    const esIndex = index.trim();

    return this.elasticSearchService.deleteIndex(esIndex);
  }

  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: "index",
    required: true,
    type: String,
    example: "dataset",
  })
  @ApiResponse({
    status: 200,
    description: "Get current index setting",
  })
  @Get("/get-index")
  async getIndex(@Query("index") index: string) {
    const esIndex = index.trim();

    return this.elasticSearchService.getIndexSettings(esIndex);
  }

  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: "index",
    required: true,
    type: String,
    example: "dataset",
  })
  @ApiResponse({
    status: 200,
    description: "Update index to the latest settings",
  })
  @Post("/update-index")
  async updateIndex(@Query("index") index: string) {
    const esIndex = index.trim();

    return this.elasticSearchService.updateIndex(esIndex);
  }
}
