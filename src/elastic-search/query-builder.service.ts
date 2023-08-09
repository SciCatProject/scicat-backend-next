import { Injectable, Logger } from "@nestjs/common";
import { SearchDtoParam } from "./dto/search.dto";
import {
  EqlSearchRequest,
  QueryDslQueryContainer,
  QueryDslTextQueryType,
} from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";

interface Filter {
  terms: {
    [key: string]: string[];
  };
}
const addTermsFilter = (
  fieldName: string,
  values: unknown,
  filterArray: Filter[],
) => {
  if (Array.isArray(values)) {
    filterArray.push({
      terms: {
        [fieldName]: values as string[],
      },
    });
  }
};
@Injectable()
export class SearchQueryBuilderService {
  public buildSearchQuery(searchParam: IDatasetFields) {
    const { text = "", ...fields } = searchParam;

    const fieldNames = ["keywords", "type", "creationLocation", "ownerGroup"];

    try {
      const query: QueryDslQueryContainer[] = [];
      const filter: Filter[] = [];

      if (text) {
        query.push({
          multi_match: {
            query: `${text}`,
            type: "best_fields",
            fields: ["description", "datasetName"],
          },
        });
      }

      for (const fieldName of fieldNames) {
        addTermsFilter(fieldName, fields[fieldName], filter);
      }

      return {
        query: {
          bool: {
            must: query,
            filter: filter,
            should: [],
          },
        },
      };
      // return {};
    } catch (err) {
      Logger.error("elastic search build search query failed");
      throw err;
    }
  }
}
