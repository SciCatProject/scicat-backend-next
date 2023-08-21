import {
  Controller,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Query,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
@ApiTags("search-service")
@Controller("search-service")
export class ElasticSearchServiceController {
  private defaultIndex =
    this.configService.get<string>("elasticSearch.defaultIndex") || "dataset";
  private baseUrl = this.configService.get<string>("logbook.baseUrl");
  private username = this.configService.get<string>("logbook.username");
  private password = this.configService.get<string>("logbook.password");

  constructor(
    private readonly elasticSearchService: ElasticSearchService,
    private readonly datasetsService: DatasetsService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @AllowAny()
  @Post("/search")
  @ApiBody({
    type: SearchDto,
  })
  async fetchESResults(@Body() searchDto: IDatasetFields) {
    return this.elasticSearchService.search(searchDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @AllowAny()
  @Post("/sync-database")
  @ApiQuery({
    name: "index",
    required: false,
    type: String,
    example: "dataset-index",
  })
  @ApiResponse({
    status: 200,
    description: "Index created successfully",
  })
  async createIndex(@Query("index") index?: string) {
    const defaultCollection: string = process.env.MONGODB_COLLECTION || "";
    const esIndex: string = index || this.defaultIndex || "";
    const collection = await this.datasetsService.getCollection(
      defaultCollection,
    );

    return this.elasticSearchService.syncDatabase(collection, esIndex);
  }

  @HttpCode(HttpStatus.OK)
  @AllowAny()
  @Post("/delete-index")
  async deleteIndex() {
    if (!this.defaultIndex) {
      throw new Error("Elastic search data-sync ENV variables are missing");
    }

    const defaultIndex = process.env.ES_INDEX || "";

    return this.elasticSearchService.deleteIndex(defaultIndex);
  }

  @HttpCode(HttpStatus.OK)
  @AllowAny()
  @Get("/get-index")
  @ApiQuery({
    name: "index",
    required: false,
    type: String,
    example: "dataset-index",
  })
  @ApiResponse({
    status: 200,
    description: "Get index successfully",
  })
  async getIndex(@Query("index") index?: string) {
    if (!process.env.ES_INDEX) {
      throw new Error("Elastic search data-sync ENV variables are missing");
    }
    console.log(
      "index",
      this.configService.get<number>("elasticSearch.fieldsLimit"),
    );
    const esIndex = index || this.defaultIndex;

    return this.elasticSearchService.getIndexSettings(esIndex);
  }

  @HttpCode(HttpStatus.OK)
  @AllowAny()
  @Post("/update-index")
  async updateIndex() {
    if (!process.env.ES_INDEX) {
      throw new Error("Elastic search data-sync ENV variables are missing");
    }

    const defaultIndex = process.env.ES_INDEX || "";

    return this.elasticSearchService.updateIndex(defaultIndex);
  }
}
