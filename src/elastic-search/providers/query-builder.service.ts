import { Injectable, Logger } from "@nestjs/common";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";

interface IShould {
  terms?: {
    [key: string]: string[] | undefined;
  };
}
interface IFilter {
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
  filterArray: IFilter[],
) => {
  if (Array.isArray(values) && values.length > 0) {
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
export class SearchQueryService {
  public buildSearchQuery(searchParam: IDatasetFields) {
    const { text = "", ...fields } = searchParam;
    const filterFields = [
      "keywords",
      "pid",
      "type",
      "creationLocation",
      "ownerGroup",
      "accessGroup",
      "isPublished",
    ];
    const queryFields = ["datasetName", "description"];

    try {
      const filter: IFilter[] = [];
      const should: IShould[] = [];
      const query: QueryDslQueryContainer[] = [];

      // Apply each filter into the query
      for (const fieldName of filterFields) {
        addTermsFilter(fieldName, fields[fieldName], filter);
      }
      // We need to make sure ownerGroup or accessGroup to includes userGroup value
      if ("userGroups" in fields) {
        const userGroupsQuery = [
          {
            terms: {
              ownerGroup: fields["userGroups"],
            },
          },
          {
            terms: {
              accessGroup: fields["userGroups"],
            },
          },
        ];
        should.push(...userGroupsQuery);
      }

      // If text query is not provided, only applies filter query .
      if (!text) {
        const filterQuery = {
          query: {
            bool: {
              filter: filter,
              should: should,
              minimum_should_match: fields.userGroups ? 1 : 0,
            },
          },
        };
        return filterQuery;
      }

      // Split text query by space and turns them into several terms, each term supports blur search.
      // Modify the splitBy based on the need.
      const splitBy = /[ ,]+/;
      const searchTermArray = text
        .toLowerCase()
        .trim()
        .split(splitBy)
        .filter(Boolean);
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
            should: should,
          },
        },
      };
    } catch (err) {
      Logger.error("elastic search build search query failed");
      throw err;
    }
  }
}
