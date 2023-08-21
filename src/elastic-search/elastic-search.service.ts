import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchQueryBuilderService } from "./query-builder.service";
import { v4 as uuidv4 } from "uuid";
import {
  SearchTotalHits,
  IndicesIndexSettingsAnalysis,
  MappingDynamicTemplate,
  SearchRequest,
} from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import {
  defaultElasticSettings,
  dynamic_template,
} from "./settings/indexSetting";
import { datasetMappings } from "./mappings/datasetFieldMapping";
import { MappingObject } from "./interfaces/mappingInterface";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";

@Injectable()
export class ElasticSearchService implements OnModuleInit {
  constructor(
    private readonly esService: ElasticsearchService,
    private readonly builderService: SearchQueryBuilderService,
  ) {}

  async onModuleInit() {
    try {
      const index = process.env.ES_INDEX || "";
      const indexExists = await this.esService.indices.exists({ index });

      if (!indexExists) {
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
      }
      return;
    } catch (error) {
      Logger.error(error);
      throw new Error("onModuleInit failed-> ElasticSearchService");
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
  }

  async updateIndex(index: string) {
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
  }

  async getIndexSettings(index: string) {
    return await this.esService.indices.getSettings({ index });
  }

  async deleteIndex(index: string) {
    await this.esService.indices.delete({ index });
  }
  async indexData(payload: string[]) {
    try {
      return await this.esService.index({
        index: process.env.ES_INDEX || "",
        id: uuidv4(),
        body: payload,
      });
    } catch (err) {
      Logger.error(err, "SearchService -> indexData");
      throw err;
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
      Logger.error(error, "SearchService || search query issue || -> search");
      throw error;
    }
  }
}
