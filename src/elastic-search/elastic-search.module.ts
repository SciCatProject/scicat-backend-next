import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { DatasetsModule } from "src/datasets/datasets.module";
import { ElasticSearchServiceController } from "./elastic-search.controller";
import { ElasticSearchService } from "./elastic-search.service";
import { SearchQueryBuilderService } from "./query-builder.service";

@Module({
  imports: [
    forwardRef(() => DatasetsModule),
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>("elasticSearch.host"),
        maxRetries: 10,
        requestTimeout: 60000,
        auth: {
          username: process.env.ES_USERNAME || "elastic",
          password: process.env.ES_PASSWORD || "password",
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ElasticSearchServiceController],
  providers: [ElasticSearchService, SearchQueryBuilderService],
  exports: [
    ElasticsearchModule,
    ElasticSearchService,
    SearchQueryBuilderService,
  ],
})
export class ElasticSearchModule {}
