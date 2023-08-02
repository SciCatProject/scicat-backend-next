import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { SearchServiceController } from "./elastic-search.controller";
import { SearchService } from "./elastic-search.service";
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
  controllers: [SearchServiceController],
  providers: [SearchService, SearchQueryBuilderService],
  exports: [ElasticsearchModule, SearchService, SearchQueryBuilderService],
})
export class ElasticSearchModule implements OnModuleInit {
  constructor(private readonly searchService: SearchService) {}
  public async onModuleInit() {
    await this.searchService.createIndex();
  }
}
