/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchDtoParam } from "./dto/search.dto";
import { SearchQueryBuilderService } from "./query-builder.service";
import { v4 as uuidv4 } from "uuid";
import { SearchTotalHits } from "@elastic/elasticsearch/lib/api/types";

type searchType =
  | "text"
  | "keyword"
  | "long"
  | "integer"
  | "date"
  | "boolean"
  | "object"
  | "nested";

interface MappingProperty {
  type: searchType;
  fields?: {
    keyword: {
      type: searchType;
    };
  };
  [key: string]: any;
}

interface MappingObject {
  properties: {
    [key: string]: MappingProperty;
  };
}

export const datasetMappings: MappingObject = {
  properties: {
    description: {
      type: "text",
      analyzer: "ngram_analyzer",
    },
    datasetName: {
      type: "text",
      analyzer: "ngram_analyzer",
    },
    scientificMetadata: {
      type: "nested",
      dynamic: true,
    },
  },
};

const defaultElasticSettings = {
  index: {
    number_of_replicas: 0,
  },
  dynamic: true,
};

@Injectable()
export class ElasticSearchService {
  constructor(
    private readonly esService: ElasticsearchService,
    private readonly builderService: SearchQueryBuilderService,
  ) {}
  public async createIndex() {
    // create index if doesn't exist
    try {
      const index = process.env.ES_INDEX || "";
      const indexExists = await this.esService.indices.exists({ index });
      if (!indexExists) {
        this.esService.indices
          .create({
            index,
            body: {
              mappings: datasetMappings,
              settings: defaultElasticSettings as any,
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
  public async indexData(payload: any) {
    try {
      return await this.esService.index({
        index: process.env.ELASTIC_INDEX || "",
        id: uuidv4(),
        body: payload,
      });
    } catch (err) {
      Logger.error(err, "SearchService -> indexData");
      throw err;
    }
  }
  public async search(searchParam: SearchDtoParam, limit = 20) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = await this.esService.search<any>({
        index: process.env.ELASTIC_INDEX || "",
        body: this.builderService.buildSearchQuery(searchParam),
        from: 0,
        size: limit,
        min_score: 0.5,
      });
      const totalCount = (body.hits.total as SearchTotalHits).value ?? 0;
      const hits = body.hits.hits;

      const data = hits.map((item: any) => {
        return {
          pid: item._source.pid,
          datasetName: item._source.datasetName,
          description: item._source.description,
          relevancy_score: item._score,
        };
      });
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
