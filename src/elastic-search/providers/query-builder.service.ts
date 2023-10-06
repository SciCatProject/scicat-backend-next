import { Injectable, Logger } from "@nestjs/common";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import { IFilter, IShould, ObjectType } from "../interfaces/es-common.type";
import { FilterFields, QueryFields } from "./fields.enum";
import { mapScientificQuery } from "src/common/utils";
import { IScientificFilter } from "src/common/interfaces/common.interface";
import { convertToElasticSearchQuery } from "../helpers/utils";

const addTermsFilter = (fieldName: string, values: unknown) => {
  const filterArray: IFilter[] = [];

  switch (fieldName) {
    case FilterFields.ScientificMetadata:
      const scientificFilterQuery = mapScientificQuery(
        values as IScientificFilter[],
      );
      const esScientificFilterQuery = convertToElasticSearchQuery(
        scientificFilterQuery,
      );

      filterArray.push({
        nested: {
          path: "scientificMetadata",
          query: {
            bool: {
              must: esScientificFilterQuery,
            },
          },
        },
      });

      break;
    case FilterFields.CreationTime:
      filterArray.push({
        range: {
          [fieldName]: {
            gte: (values as ObjectType).begin,
            lte: (values as ObjectType).end,
          },
        },
      });
      break;
    case FilterFields.Pid:
      filterArray.push({
        term: {
          [fieldName]: values as string,
        },
      });
      break;

    default:
      filterArray.push({
        terms: {
          [fieldName]: values as string[],
        },
      });
  }
  return filterArray;
};
@Injectable()
export class SearchQueryService {
  readonly filterFields = [...Object.values(FilterFields)];
  readonly queryFields = [...Object.values(QueryFields)];
  readonly textQuerySplitMethod = /[ ,]+/;

  public buildSearchQuery(searchParam: IDatasetFields) {
    try {
      const { text = "", ...fields } = searchParam;

      const filter = this.buildFilterFields(fields);
      const should = this.buildShouldFields(fields);
      const query = this.buildTextQuery(text);

      return this.constructFinalQuery(filter, should, query, fields.userGroups);
    } catch (err) {
      Logger.error("Elastic search build search query failed");
      throw err;
    }
  }
  private buildFilterFields(fields: Partial<IDatasetFields>): IFilter[] {
    const filter: IFilter[] = [];

    filter.push({ term: { isPublished: fields["isPublished"] ?? false } });

    for (const fieldName of this.filterFields) {
      if (fields[fieldName]) {
        const additionalFilters = addTermsFilter(fieldName, fields[fieldName]);
        filter.push(...additionalFilters);
      }
    }

    return filter;
  }

  private buildShouldFields(fields: Partial<IDatasetFields>): IShould[] {
    return fields["userGroups"]
      ? [
          { terms: { ownerGroup: fields["userGroups"] } },
          { terms: { accessGroup: fields["userGroups"] } },
        ]
      : [];
  }

  private buildTextQuery(text: string): QueryDslQueryContainer[] {
    const terms = this.splitSearchText(text);
    const wildcardQueries = this.buildWildcardQueries(terms);
    return wildcardQueries.length > 0
      ? [{ bool: { should: wildcardQueries, minimum_should_match: 1 } }]
      : [];
  }

  private splitSearchText(text: string): string[] {
    return text
      .toLowerCase()
      .trim()
      .split(this.textQuerySplitMethod)
      .filter(Boolean);
  }

  private buildWildcardQueries(terms: string[]): QueryDslQueryContainer[] {
    const wildcardQueries: QueryDslQueryContainer[] = [];
    for (const term of terms) {
      for (const fieldName of this.queryFields) {
        const query = {
          wildcard: {
            [fieldName]: {
              value: `*${term}*`,
            },
          },
        };
        wildcardQueries.push(query);
      }
    }

    return wildcardQueries;
  }

  private constructFinalQuery(
    filter: IFilter[],
    should: IShould[],
    query: QueryDslQueryContainer[],
    userGroups?: string[],
  ) {
    return {
      query: {
        bool: {
          filter,
          should,
          must: query,
          minimum_should_match: userGroups ? 1 : 0,
        },
      },
    };
  }
}
