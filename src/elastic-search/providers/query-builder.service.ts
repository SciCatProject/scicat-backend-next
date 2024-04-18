import { Injectable, Logger } from "@nestjs/common";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import {
  IBoolShould,
  IFilter,
  IFullFacets,
  IShould,
  ObjectType,
} from "../interfaces/es-common.type";
import {
  FilterFields,
  QueryFields,
  FacetFields,
  ShouldFields,
} from "./fields.enum";

import { mapScientificQuery } from "src/common/utils";
import { IScientificFilter } from "src/common/interfaces/common.interface";
import { convertToElasticSearchQuery } from "../helpers/utils";

@Injectable()
export class SearchQueryService {
  readonly filterFields = [...Object.values(FilterFields)];
  readonly queryFields = [...Object.values(QueryFields)];
  readonly shouldFields = [...Object.values(ShouldFields)];
  readonly facetFields = [...Object.values(FacetFields)];
  readonly textQuerySplitMethod = /[ ,]+/;

  public buildSearchQuery(searchParam: IDatasetFields) {
    try {
      const { ...fields } = searchParam;

      const filter = this.buildFilterFields(fields);
      const should = this.buildShouldFields(fields);
      const query = this.buildTextQuery(fields);

      return this.constructFinalQuery(filter, should, query);
    } catch (err) {
      Logger.error("Elastic search build search query failed");
      throw err;
    }
  }
  private buildFilterFields(fields: Partial<IDatasetFields>): IFilter[] {
    const filter: IFilter[] = [];

    for (const fieldName of this.filterFields) {
      if (fields[fieldName]) {
        const filterQueries = this.buildTermsFilter(
          fieldName,
          fields[fieldName],
        );
        filter.push(...filterQueries);
      }
    }

    return filter;
  }

  private buildShouldFields(fields: Partial<IDatasetFields>) {
    const shouldFilter: IShould[] = [];
    if (fields["sharedWith"]) {
      const termFilter = { terms: { sharedWith: fields["sharedWith"] } };

      shouldFilter.push(termFilter);
    }

    if (fields["userGroups"]) {
      const ownerGroup = { terms: { ownerGroup: fields["userGroups"] } };
      const accessGroups = { terms: { accessGroups: fields["userGroups"] } };

      shouldFilter.push(ownerGroup, accessGroups);
    }
    return { bool: { should: shouldFilter, minimum_should_match: 1 } };
  }

  private buildTextQuery(
    fields: Partial<IDatasetFields>,
  ): QueryDslQueryContainer[] {
    let wildcardQueries: QueryDslQueryContainer[] = [];
    const { text } = fields;

    //NOTE: if text field is present, we query both datasetName and description fields
    if (text) {
      wildcardQueries = this.buildWildcardQueries(text);
    }

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

  private buildWildcardQueries(text: string): QueryDslQueryContainer[] {
    const terms = this.splitSearchText(text);
    return terms.flatMap((term) =>
      this.queryFields.map((fieldName) => ({
        wildcard: { [fieldName]: { value: `*${term}*` } },
      })),
    );
  }

  private buildTermsFilter(fieldName: string, values: unknown) {
    const filterArray: IFilter[] = [];

    if (Array.isArray(values) && values.length === 0) {
      return filterArray;
    }

    switch (fieldName) {
      case FilterFields.ScientificMetadata:
        const scientificFilterQuery = mapScientificQuery(
          fieldName,
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

      case FilterFields.IsPublished:
        filterArray.push({
          term: {
            [fieldName]: values as boolean,
          },
        });
        break;
      default:
        if (Array.isArray(values)) {
          filterArray.push({
            terms: {
              [fieldName]: values,
            },
          });
        }
        if (typeof values === "string") {
          filterArray.push({
            match: {
              [`${fieldName}.keyword`]: values as string,
            },
          });
        }
        break;
    }
    return filterArray;
  }

  private constructFinalQuery(
    filter: IFilter[],
    should: IBoolShould,
    query: QueryDslQueryContainer[],
  ) {
    const finalQuery = {
      query: {
        bool: {
          filter: [...filter, should],
          must: query,
        },
      },
    };
    return finalQuery;
  }

  public buildFullFacetPipeline(facetFields = this.facetFields) {
    const pipeline: IFullFacets = {
      all: {
        value_count: {
          field: "pid",
        },
      },
    };

    for (const field of facetFields) {
      pipeline[field] = {
        terms: {
          field: field,
          order: {
            _count: "desc",
          },
        },
      };
    }
    return pipeline;
  }
}
