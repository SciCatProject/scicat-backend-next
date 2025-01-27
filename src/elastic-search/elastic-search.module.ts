import { Module, forwardRef } from "@nestjs/common";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";
import { ElasticSearchServiceController } from "./elastic-search.controller";
import { ElasticSearchService } from "./elastic-search.service";
import { SearchQueryService } from "./providers/query-builder.service";

@Module({
  imports: [forwardRef(() => DatasetsModule)],
  controllers: [ElasticSearchServiceController],
  providers: [ElasticSearchService, SearchQueryService, CaslAbilityFactory],
  exports: [ElasticSearchService, SearchQueryService],
})
export class ElasticSearchModule {}
