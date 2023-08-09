import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ElasticSearchServiceController } from "./elastic-search.controller";
import { ElasticSearchService } from "./elastic-search.service";
import { SearchQueryBuilderService } from "./query-builder.service";

@Module({
  imports: [
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
export class ElasticSearchModule implements OnModuleInit {
  constructor(private readonly elasticSearchService: ElasticSearchService) {}
  public async onModuleInit() {
    await this.elasticSearchService.createIndex();
  }
}
