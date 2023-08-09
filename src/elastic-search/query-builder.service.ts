import { Injectable, Logger } from "@nestjs/common";
import { SearchDtoParam } from "./dto/search.dto";
import {
  QueryDslQueryContainer,
  QueryDslTextQueryType,
} from "@elastic/elasticsearch/lib/api/types";

@Injectable()
export class SearchQueryBuilderService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public buildSearchQuery(searchParam: SearchDtoParam) {
    const { search_term } = searchParam;
    try {
      const query: QueryDslQueryContainer[] = [];
      let flag = false;
      if (search_term) {
        flag = true;

        console.log("---helllo", search_term);

        query.push({
          multi_match: {
            query: `${search_term}`,
            type: "best_fields",
            fields: ["description", "datasetName"],
          },
        });
      }

      if (flag) {
        return {
          query: {
            bool: {
              must: query,
              should: [],
            },
          },
        };
      }
      return {};
    } catch (err) {
      Logger.error("elastic search build search query failed");
      throw err;
    }
  }

  private selectQueryType(search_term: string): QueryDslTextQueryType {
    const prefixes = /[_@]/;
    const hasPrefixes = prefixes.test(search_term);
    // if (hasPrefixes) {
    //   return "phrase_prefix";
    // }
    return "cross_fields";
  }
}
