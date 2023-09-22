import {Injectable, Logger} from "@nestjs/common";
import {QueryDslQueryContainer} from "@elastic/elasticsearch/lib/api/types";
import {IDatasetFields} from "src/datasets/interfaces/dataset-filters.interface";

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
    [key: string]: boolean;
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
};
@Injectable()
export class SearchQueryService {
  readonly filterFields = [
    "keywords",
    "pid",
    "type",
    "creationLocation",
    "creationTime",
    "ownerGroup",
    "accessGroup",
    "isPublished",
    "scientificMetadata",
  ];
  readonly queryFields = ["datasetName", "description"];
  readonly textQuerySplitMethod = /[ ,]+/;
  public buildSearchQuery(searchParam: IDatasetFields) {
    try {
      const {text = "", ...fields} = searchParam;
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

    const isPublished = fields["isPublished"] ?? false;
    filter.push({term: {isPublished: isPublished}});

    for (const fieldName of this.filterFields) {
      if (fields[fieldName]) {
        addTermsFilter(fieldName, fields[fieldName], filter);
      }
    }

    return filter;
  }

  private buildShouldFields(fields: Partial<IDatasetFields>): IShould[] {
    const should: IShould[] = [];
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
    return should;
  }

  private buildTextQuery(text: string): QueryDslQueryContainer[] {
    const query: QueryDslQueryContainer[] = [];
    const searchTermArray = text
      .toLowerCase()
      .trim()
      .split(this.textQuerySplitMethod)
      .filter(Boolean);
    const wildcardQueries = searchTermArray.flatMap((term) =>
      this.queryFields.map((fieldName) => ({
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

    return query;
  }

  private constructFinalQuery(
    filter: IFilter[],
    should: IShould[],
    query: QueryDslQueryContainer[],
    userGroups?: string[],
  ) {
    if (!query.length) {
      return {
        query: {
          bool: {
            filter: filter,
            should: should,
            minimum_should_match: userGroups ? 1 : 0,
          },
        },
      };
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
  }
}
