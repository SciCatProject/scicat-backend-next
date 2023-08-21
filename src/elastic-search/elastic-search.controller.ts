import { Controller, Body, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { DatasetsService } from "src/datasets/datasets.service";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import { SearchDto } from "./dto/search.dto";
import { ElasticSearchService } from "./elastic-search.service";

@ApiBearerAuth()
@ApiTags("search-service")
@Controller("search-service")
export class ElasticSearchServiceController {
  constructor(
    private readonly elasticSearchService: ElasticSearchService,
    private readonly datasetsService: DatasetsService,
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
  async createIndex() {
    if (!process.env.MONGODB_COLLECTION || !process.env.ES_INDEX) {
      throw new Error("Elastic search data-sync ENV variables are missing");
    }

    const defaultCollection = process.env.MONGODB_COLLECTION || "";
    const defaultIndex = process.env.ES_INDEX || "";
    const collection = await this.datasetsService.getCollection(
      defaultCollection,
    );

    return this.elasticSearchService.syncDatabase(collection, defaultIndex);
  }
}
