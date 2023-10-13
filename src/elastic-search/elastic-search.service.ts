import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";

import { Client } from "@elastic/elasticsearch";
import { SearchQueryService } from "./providers/query-builder.service";
import {
  SearchTotalHits,
  SearchRequest,
} from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import {
  defaultElasticSettings,
  dynamic_template,
} from "./configuration/indexSetting";
import { datasetMappings } from "./configuration/datasetFieldMapping";
import {
  DatasetClass,
  DatasetDocument,
} from "src/datasets/schemas/dataset.schema";
import { ConfigService } from "@nestjs/config";
import { sleep } from "src/common/utils";
import { transformKeysInObject, initialSyncTransform } from "./helpers/utils";

@Injectable()
export class ElasticSearchService implements OnModuleInit {
  private esService: Client;
  private host: string;
  private username: string;
  private password: string;
  private refresh: "false" | "wait_for";
  public defaultIndex: string;
  public esEnabled: boolean;
  public connected = false;

  constructor(
    private readonly searchService: SearchQueryService,
    private readonly configService: ConfigService,
  ) {
    this.host = this.configService.get<string>("elasticSearch.host") || "";
    this.username =
      this.configService.get<string>("elasticSearch.username") || "";
    this.password =
      this.configService.get<string>("elasticSearch.password") || "";
    this.esEnabled =
      this.configService.get<string>("elasticSearch.enabled") === "yes"
        ? true
        : false;
    this.refresh =
      this.configService.get<"false" | "wait_for">("elasticSearch.refresh") ||
      "false";

    this.defaultIndex =
      this.configService.get<string>("elasticSearch.defaultIndex") || "";

    if (!this.host || !this.username || !this.password || !this.defaultIndex) {
      Logger.error(
        "Missing ENVIRONMENT variables for elastic search connection",
      );
    }
  }

  async onModuleInit() {
    if (!this.esEnabled) {
      this.connected = false;
      return;
    }

    try {
      await this.retryConnection(3, 3000);
      const isIndexExists = await this.isIndexExists(this.defaultIndex);
      if (!isIndexExists) {
        await this.createIndex(this.defaultIndex);
      }
      this.connected = true;
      Logger.log("Elasticsearch Connected");
    } catch (error) {
      Logger.error("onModuleInit failed-> ElasticSearchService", error);
    }
  }

  private async connect() {
    const connection = new Client({
      node: this.host,
      auth: {
        username: this.username,
        password: this.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await connection.ping();
    this.esService = connection;
  }
  private async retryConnection(maxRetries: number, interval: number) {
    let retryCount = 0;
    while (maxRetries > retryCount) {
      await sleep(interval);
      try {
        await this.connect();
        break;
      } catch (error) {
        Logger.error(`Retry attempt ${retryCount + 1} failed:`, error);
        retryCount++;
      }
    }

    if (retryCount === maxRetries) {
      throw new HttpException(
        "Max retries reached; check Elasticsearch config.",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async isIndexExists(index = this.defaultIndex) {
    return await this.esService.indices.exists({
      index,
    });
  }

  async createIndex(index = this.defaultIndex) {
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
      Logger.log(`Elasticsearch Index Created-> Index: ${index}`);
      return HttpStatus.CREATED;
    } catch (error) {
      Logger.error("createIndex failed-> ElasticSearchService", error);
      throw new HttpException(
        `createIndex failed-> ElasticSearchService ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async syncDatabase(collection: DatasetClass[], index = this.defaultIndex) {
    const indexExists = await this.esService.indices.exists({ index });
    if (!indexExists) {
      throw new Error("Index not found");
    }

    const bulkResponse = await this.performBulkOperation(collection, index);

    Logger.log(
      JSON.stringify(bulkResponse, null, 0),
      "Elasticsearch Data Synchronization Response",
    );

    return bulkResponse;
  }

  async updateIndex(index = this.defaultIndex) {
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
      Logger.log(`Elasticsearch Index Updated-> Index: ${index}`);
    } catch (error) {
      Logger.error("updateIndex failed-> ElasticSearchService", error);
      throw new HttpException(
        `updateIndex failed-> ElasticSearchService ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getIndexSettings(index = this.defaultIndex) {
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

  async deleteIndex(index = this.defaultIndex) {
    try {
      await this.esService.indices.delete({ index });
      Logger.log(`Elasticsearch Index Deleted-> Index: ${index} `);
      return { success: true, message: `Index ${index} deleted` };
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
      const searchQuery = this.searchService.buildSearchQuery(searchParam);

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

  async updateInsertDocument(data: DatasetDocument) {
    //NOTE: Replace all keys with lower case, also replace spaces and dot with underscore
    delete data._id;
    const transformedScientificMetadata = transformKeysInObject(
      data.scientificMetadata as Record<string, unknown>,
    );

    const transformedData = {
      ...data,
      scientificMetadata: transformedScientificMetadata,
    };
    try {
      await this.esService.index({
        index: this.defaultIndex,
        id: data.pid,
        document: transformedData,
        refresh: this.refresh,
      });

      Logger.log(
        `Elasticsearch Document Update/inserted-> Document_id: ${data.pid} update/inserted on index: ${this.defaultIndex}`,
      );
    } catch (error) {
      Logger.error("updateDocument failed-> ElasticSearchService", error);
    }
  }

  async deleteDocument(id: string) {
    try {
      await this.esService.delete({
        index: this.defaultIndex,
        id,
      });
      Logger.log(
        `Elasticsearch Document Deleted-> Document_id: ${id} deleted on index: ${this.defaultIndex}`,
      );
    } catch (error) {
      Logger.error("deleteDocument failed-> ElasticSearchService", error);
    }
  }

  // *** NOTE: below are helper methods ***

  async performBulkOperation(collection: DatasetClass[], index: string) {
    return await this.esService.helpers.bulk({
      retries: 3,
      wait: 10000,
      datasource: collection,
      onDocument(doc: DatasetClass) {
        return [
          {
            index: {
              _index: index,
              _id: doc.pid,
            },
          },
          initialSyncTransform(doc),
        ];
      },
      onDrop(doc) {
        console.error(doc.document._id, doc.error?.reason);
        Logger.error("data insert faield: ", doc.document._id);
      },
    });
  }
}
