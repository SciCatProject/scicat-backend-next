/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchDtoParam } from "./dto/search.dto";
import { SearchQueryBuilderService } from "./query-builder.service";
import { v4 as uuidv4 } from "uuid";
import { SearchTotalHits } from "@elastic/elasticsearch/lib/api/types";

interface MappingProperty {
  type:
    | "text"
    | "keyword"
    | "long"
    | "integer"
    | "date"
    | "boolean"
    | "object"
    | "nested";
  [key: string]: string | boolean;
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
    },
    datasetName: {
      type: "text",
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
};

@Injectable()
export class SearchService {
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
              settings: defaultElasticSettings,
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
  public async search(searchParam: SearchDtoParam) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = await this.esService.search<any>({
        index: process.env.ELASTIC_INDEX || "",
        body: this.builderService.buildSearchQuery(searchParam),
        from: 0,
        size: 5,
        min_score: 5,
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
