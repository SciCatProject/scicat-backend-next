import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DatasetClass,
  DatasetSchema,
} from "src/datasets/schemas/dataset.schema";
import { ElasticSearchServiceController } from "./elastic-search.controller";
import { ElasticSearchService } from "./elastic-search.service";
import { SearchQueryService } from "./providers/query-builder.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DatasetClass.name, schema: DatasetSchema },
    ]),
    ConfigModule,
  ],
  controllers: [ElasticSearchServiceController],
  providers: [ElasticSearchService, SearchQueryService, ConfigService],
  exports: [ElasticSearchService, SearchQueryService],
})
export class ElasticSearchModule {}
