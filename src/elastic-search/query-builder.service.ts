import { Injectable, Logger } from "@nestjs/common";
import { SearchDtoParam } from "./dto/search.dto";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";

@Injectable()
export class SearchQueryBuilderService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public buildSearchQuery(searchParam: SearchDtoParam) {
    // tslint:disable-next-line:naming-convention
    const { search_term } = searchParam;
    try {
      const query: QueryDslQueryContainer[] = [];
      let flag = false;
      if (search_term) {
        flag = true;
        query.push({
          multi_match: {
            query: `${search_term}`,
            type: "best_fields",
            fields: ["description", "datasetName"],
            fuzziness: "AUTO",
            prefix_length: 1,
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
}
