import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DatasetsModule } from "src/datasets/datasets.module";
import { ElasticSearchServiceController } from "./elastic-search.controller";
import { ElasticSearchService } from "./elastic-search.service";
import { SearchQueryBuilderService } from "./query-builder.service";

@Module({
  imports: [forwardRef(() => DatasetsModule), ConfigModule],
  controllers: [ElasticSearchServiceController],
  providers: [ElasticSearchService, SearchQueryBuilderService, ConfigService],
  exports: [ElasticSearchService, SearchQueryBuilderService],
})
export class ElasticSearchModule {}
