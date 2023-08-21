/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchQueryBuilderService } from "./query-builder.service";
import { v4 as uuidv4 } from "uuid";
import {
  SearchTotalHits,
  IndicesIndexSettingsAnalysis,
  MappingDynamicTemplate,
} from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import { autocomplete_tokenizer } from "./settings/indexSetting";
import { datasetMappings } from "./mappings/datasetFieldMapping";
import { MappingObject } from "./interfaces/mappingInterface";

const defaultElasticSettings = {
  dynamic: true,
  index: {
    max_result_window: process.env.ES_MAX_RESULT,
    number_of_replicas: 0,
    mapping: {
      total_fields: {
        limit: process.env.ES_FIELDS_LIMIT,
      },
    },
  },
  analysis: {
    analyzer: {
      autocomplete: {
        tokenizer: "autocomplete",
        filter: ["lowercase"],
      },
      autocomplete_search: {
        tokenizer: "lowercase",
      },
    },
    tokenizer: {
      autocomplete: autocomplete_tokenizer,
    },
  },
};

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
        this.esService.indices
          .create({
            index,
            body: {
              mappings: datasetMappings,
              settings: defaultElasticSettings as IndicesIndexSettingsAnalysis,
            },
          })
          .catch((err) => {
            if (err) {
              Logger.error(err, "SearchService -> createIndex");
              throw err;
            }
          });
      }
    } catch (err) {
      Logger.error(err, "SearchService -> createIndex");
      throw err;
    }
  }

  async syncDatabase(collection: any, index: string) {
    let errorCount = 0;
    try {
      const operations = collection.flatMap((doc: any) => [
        { index: { _index: index } },
        doc,
      ]);

      console.log("=====operations,", operations);

      const bulkResponse = await this.esService.helpers.bulk({
        retries: 3,
        wait: 3000,
        datasource: operations,
        onDocument(doc: any) {
          delete doc._id;
          return {
            index: {
              _index: index,
            },
          };
        },
        onDrop(doc: any) {
          console.error(`Failed Number ${++errorCount}`, doc.error);
        },
      });
      console.log("======bulkResponse", bulkResponse);
    } catch (error) {
      Logger.error(error, "SearchService -> syncDatabase");
    }
  }

  async updateIndex(
    index: string,
    mappings: MappingObject,
    settings: any,
    dynamic_templates: Record<string, MappingDynamicTemplate>[],
  ) {
    await this.esService.indices.close({
      index,
    });
    await this.esService.indices.putSettings({
      index,
      body: { settings },
    });

    await this.esService.indices.putMapping({
      index,
      dynamic: true,
      body: {
        properties: mappings,
        dynamic_templates,
      },
    });

    await this.esService.indices.open({
      index,
    });

    // console.log(response);
  }
  async indexData(payload: any) {
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
  ): Promise<{ totalCount: number; data: any[] }> {
    const defaultMinScore = searchParam.text ? 1 : 0;

    try {
      const searchQuery = this.builderService.buildSearchQuery(searchParam);

      const searchOptions: any = {
        track_scores: true,
        body: searchQuery,
        size: limit + skip,
        sort: [{ _score: "desc" }],
        min_score: defaultMinScore,
        track_total_hits: true,
        _source: [""],
      };

      const body = await this.esService.search(searchOptions);

      const totalCount = (body.hits.total as SearchTotalHits)?.value || 0;

      const data = body.hits.hits.map((item: any) => item._id);

      return {
        totalCount,
        data,
      };
    } catch (err) {
      Logger.error(err, "SearchService || search query issue || -> search");
      throw err;
    }
  }
}
