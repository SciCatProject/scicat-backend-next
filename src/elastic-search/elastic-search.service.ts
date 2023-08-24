import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { Client, ClientOptions } from "@elastic/elasticsearch";
import { SearchQueryBuilderService } from "./query-builder.service";
import {
  SearchTotalHits,
  SearchRequest,
} from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import {
  defaultElasticSettings,
  dynamic_template,
} from "./settings/indexSetting";
import { datasetMappings } from "./mappings/datasetFieldMapping";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { ConfigService } from "@nestjs/config";
import { throwError } from "rxjs";

@Injectable()
export class ElasticSearchService {
  private esService: Client;
  private host: string | undefined;
  private username: string | undefined;
  private password: string | undefined;
  constructor(
    private readonly builderService: SearchQueryBuilderService,
    private readonly configService: ConfigService,
  ) {
    this.host = this.configService.get<string>("elasticSearch.host");
    this.username = this.configService.get<string>("elasticSearch.username");
    this.password = this.configService.get<string>("elasticSearch.password");
  }
  async connect(connectOptions: ClientOptions) {
    try {
      this.esService = new Client(connectOptions);
    } catch (error) {
      Logger.error("connect failed-> ElasticSearchService", error);
    }
  }
  async onModuleInit() {
    const esEnabled =
      this.configService.get<string>("elasticSearch.enabled") === "yes"
        ? true
        : false;

    if (!esEnabled) return;
    if (!this.host || !this.username || !this.password) {
      Logger.error(
        "Missing ENVIRONMENT variables for elastic search connection",
      );
      return;
    }
    try {
      await this.connect({
        node: this.host,
        maxRetries: 10,
        requestTimeout: 60000,
        auth: {
          username: this.username,
          password: this.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const index =
        this.configService.get<string>("elasticSearch.defaultIndex") || "";
      const indexExists = await this.esService.indices.exists({ index });

      if (!indexExists) {
        this.createIndex(index);
      }
      return;
    } catch (error) {
      Logger.error("onModuleInit failed-> ElasticSearchService", error);
    }
  }
  async createIndex(index: string) {
    try {
      await this.esService.indices.create({
        index,
        body: {
          settings: defaultElasticSettings,
        },
      });
      await this.esService.indices.close({ index });
      await this.esService.indices.putSettings({
        index,
        body: {
          settings: defaultElasticSettings,
        },
      });
      await this.esService.indices.putMapping({
        index,
        dynamic: true,
        body: {
          dynamic_templates: dynamic_template,
          properties: datasetMappings,
        },
      });
      await this.esService.indices.open({
        index,
      });
      Logger.log(`Index created with index name: ${index}`);
      return HttpStatus.CREATED;
    } catch (error) {
      Logger.error("createIndex failed-> ElasticSearchService", error);
      throw new HttpException(
        `createIndex failed-> ElasticSearchService ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async syncDatabase(collection: DatasetClass[], index: string) {
    const indexExists = await this.esService.indices.exists({ index });
    if (!indexExists) {
      throw new Error("Index not found");
    }
    const bulkResponse = await this.esService.helpers.bulk({
      retries: 3,
      wait: 3000,
      datasource: collection,
      onDocument(doc) {
        return {
          index: {
            _index: index,
            _id: doc.pid,
          },
        };
      },
      onDrop(doc) {
        Logger.error("Bulk drop failed", doc.error);
      },
    });
    Logger.log("bulkResponse", bulkResponse);

    return bulkResponse;
  }

  async updateIndex(index: string) {
    try {
      await this.esService.indices.close({
        index,
      });
      await this.esService.indices.putSettings({
        index,
        body: { settings: defaultElasticSettings },
      });

      await this.esService.indices.putMapping({
        index,
        dynamic: true,
        body: {
          properties: datasetMappings,
          dynamic_templates: dynamic_template,
        },
      });

      await this.esService.indices.open({
        index,
      });
    } catch (error) {
      Logger.error("updateIndex failed-> ElasticSearchService", error);
      throw new HttpException(
        `updateIndex failed-> ElasticSearchService ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getIndexSettings(index: string) {
    try {
      return await this.esService.indices.getSettings({ index });
    } catch (error) {
      Logger.error("getIndexSettings failed-> ElasticSearchService", error);
      throw new HttpException(
        `getIndexSettings failed-> ElasticSearchService ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteIndex(index: string) {
    try {
      await this.esService.indices.delete({ index });
    } catch (error) {
      Logger.error("deleteIndex failed-> ElasticSearchService", error);
      throw new HttpException(
        `deleteIndex failed-> ElasticSearchService ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async search(
    searchParam: IDatasetFields,
    limit = 20,
    skip = 0,
  ): Promise<{ totalCount: number; data: string[] }> {
    const defaultMinScore = searchParam.text ? 1 : 0;

    try {
      const searchQuery = this.builderService.buildSearchQuery(searchParam);

      const searchOptions = {
        track_scores: true,
        body: searchQuery,
        size: limit + skip,
        sort: [{ _score: { order: "desc" } }],
        min_score: defaultMinScore,
        track_total_hits: true,
        _source: [""],
      } as SearchRequest;

      const body = await this.esService.search(searchOptions);

      const totalCount = (body.hits.total as SearchTotalHits)?.value || 0;

      const data = body.hits.hits.map((item) => item._id);

      return {
        totalCount,
        data,
      };
    } catch (error) {
      Logger.error("SearchService || search query issue || -> search", error);

      throw new HttpException(
        `SearchService || search query issue || -> search ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
