import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";
import { ElasticSearchServiceController } from "./elastic-search.controller";
import { ElasticSearchService } from "./elastic-search.service";
import { SearchQueryService } from "./providers/query-builder.service";

@Module({
  imports: [forwardRef(() => DatasetsModule), ConfigModule],
  controllers: [ElasticSearchServiceController],
  providers: [
    ElasticSearchService,
    SearchQueryService,
    ConfigService,
    CaslAbilityFactory,
  ],
  exports: [ElasticSearchService, SearchQueryService],
})
export class ElasticSearchModule {}
