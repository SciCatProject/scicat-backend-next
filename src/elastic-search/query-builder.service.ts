import { Injectable, Logger } from "@nestjs/common";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";

interface Filter {
  terms?: {
    [key: string]: string[] | boolean[];
  };
  term?: {
    [key: string]: string | boolean;
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
        [fieldName]: values,
      },
    });
  }
  if (typeof values === "boolean") {
    filterArray.push({
      term: {
        [fieldName]: values,
      },
    });
  }
};
@Injectable()
export class SearchQueryBuilderService {
  public buildSearchQuery(searchParam: IDatasetFields) {
    const { text = "", ...fields } = searchParam;
    const filterFields = [
      "keywords",
      "type",
      "creationLocation",
      "ownerGroup",
      "isPublished",
    ];
    const queryFields = ["datasetName", "description"];

    try {
      const query: QueryDslQueryContainer[] = [];
      const filter: Filter[] = [];

      for (const fieldName of filterFields) {
        addTermsFilter(fieldName, fields[fieldName], filter);
      }

      if (!text) {
        return {
          query: {
            bool: {
              filter: filter,
            },
          },
        };
      }

      // query.push({
      //   // multi_match: {
      //   //   query: `${text}`,
      //   //   type: "best_fields", //This type searches for a phrase across the fields, considering the order of terms.
      //   //   fields: ["datasetName", "description"],
      //   //   fuzziness: "AUTO",
      //   // },
      //   // wildcard: {
      //   //   datasetName: {
      //   //     value: text,
      //   //   },
      //   // },
      // });

      const searchTermArray = text.toLowerCase().split(" ");
      const wildcardQueries = searchTermArray.flatMap((term) =>
        queryFields.map((fieldName) => ({
          wildcard: {
            [fieldName]: {
              value: `*${term}*`,
            },
          },
        })),
      );

      if (wildcardQueries.length > 0) {
        query.push({
          bool: {
            should: wildcardQueries,
            minimum_should_match: 1,
          },
        });
      }

      return {
        query: {
          bool: {
            filter: filter,
            must: query,
          },
        },
      };
    } catch (err) {
      Logger.error("elastic search build search query failed");
      throw err;
    }
  }
}
