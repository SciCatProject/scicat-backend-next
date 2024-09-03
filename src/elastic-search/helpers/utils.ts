import {
  AggregationsAggregate,
  AggregationsFrequentItemSetsBucketKeys,
} from "@elastic/elasticsearch/lib/api/types";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import {
  IFilter,
  ITransformedFullFacets,
  nestedQueryObject,
  ScientificQuery,
} from "../interfaces/es-common.type";

export const transformKey = (key: string): string => {
  return key.trim().replace(/[.]/g, "\\.").replace(/ /g, "_").toLowerCase();
};
export const addValueType = (obj: Record<string, unknown>) => {
  const newObj: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = transformKey(key);

    const isNumberValueType =
      typeof (value as Record<string, unknown>)?.value === "number";

    if (isNumberValueType) {
      (value as Record<string, unknown>)["value_type"] = "number";
    } else {
      (value as Record<string, unknown>)["value_type"] = "string";
    }
    newObj[newKey] = value;
  }

  return newObj;
};

export const transformMiddleKey = (key: string) => {
  const parts = key.trim().split(".");
  const firstPart = parts[0];
  const lastPart = parts[parts.length - 1];

  const middlePartRaw = parts.slice(1, parts.length - 1).join(".");
  const middlePart = transformKey(middlePartRaw);

  let transformedKey = firstPart;
  if (middlePart) {
    transformedKey += `.${middlePart}`;
  }
  transformedKey += `.${lastPart}`;

  return { transformedKey, firstPart, middlePart, lastPart };
};

export const initialSyncTransform = (obj: DatasetClass) => {
  const modifedDocInArray = !!obj.scientificMetadata
    ? Object.entries(
        obj.scientificMetadata as Record<string, { [key: string]: string }>,
      ).map(([key, value]) => {
        const transformdKey = transformKey(key);

        return typeof value.value === "number"
          ? [transformdKey, { ...value, value_type: "number" }]
          : [transformdKey, { ...value, value_type: "string" }];
      })
    : [];

  const modifiedDocInObject = {
    ...obj,
    scientificMetadata:
      modifedDocInArray.length > 0 ? Object.fromEntries(modifedDocInArray) : {},
  };

  return modifiedDocInObject;
};

const extractNestedQueryOperationValue = (query: nestedQueryObject) => {
  const field = Object.keys(query)[0];
  const operationWithPrefix = Object.keys(query[field])[0];

  const value =
    typeof query[field][operationWithPrefix] === "string"
      ? (query[field][operationWithPrefix] as string).trim()
      : query[field][operationWithPrefix];

  const operation = operationWithPrefix.replace("$", "");

  return { operation, value, field };
};

export const convertToElasticSearchQuery = (
  scientificQuery: ScientificQuery,
): IFilter[] => {
  const filters: IFilter[] = [];

  for (const field in scientificQuery) {
    const query = scientificQuery[field];

    if (field === "$and" && Array.isArray(query)) {
      query.forEach((query: { $or: nestedQueryObject[] }) => {
        const shouldQueries = query.$or.map((orQuery: nestedQueryObject) => {
          const { operation, value, field } =
            extractNestedQueryOperationValue(orQuery);
          const filterType = operation === "eq" ? "term" : "range";
          return {
            [filterType]: {
              [field]: operation === "eq" ? value : { [operation]: value },
            },
          };
        });
        filters.push({
          bool: {
            should: shouldQueries,
            minimum_should_match: 1,
          },
        });
      });
    } else if (field === "$or" && Array.isArray(query)) {
      const shouldQueries = query.map((query: nestedQueryObject) => {
        const { operation, value, field } =
          extractNestedQueryOperationValue(query);
        const filterType = operation === "eq" ? "term" : "range";
        return {
          [filterType]: {
            [field]: operation === "eq" ? value : { [operation]: value },
          },
        };
      });
      filters.push({
        bool: {
          should: shouldQueries,
          minimum_should_match: 1,
        },
      });
    } else {
      const operation = Object.keys(query)[0];

      const value =
        typeof (query as Record<string, "eq">)[operation] === "string"
          ? (query as Record<string, "eq">)[operation].trim()
          : (query as Record<string, "eq">)[operation];
      const esOperation = operation.replace("$", "");

      // NOTE:
      // trasnformedKey = "scientificMetadata.someKey.value"
      // firstPart = "scientificMetadata",
      // middlePart = "someKey"
      // lastPart = "value"
      const { transformedKey, firstPart, middlePart, lastPart } =
        transformMiddleKey(field);

      if (lastPart === "valueSI" || lastPart === "value") {
        const numberFilter = {
          term: {
            [`${firstPart}.${middlePart}.value_type`]:
              typeof value === "number" ? "number" : "string",
          },
        };
        filters.push(numberFilter);
      }

      const filter =
        esOperation === "eq"
          ? {
              term: { [`${transformedKey}`]: value },
            }
          : {
              range: { [`${transformedKey}`]: { [esOperation]: value } },
            };

      filters.push(filter);
    }
  }
  return filters;
};

export const transformFacets = (
  aggregation: AggregationsAggregate,
): Record<string, unknown>[] => {
  const transformed = Object.entries(aggregation).reduce(
    (acc, [key, value]) => {
      const isBucketArray = Array.isArray(value.buckets);

      acc[key] = isBucketArray
        ? value.buckets.map(
            (bucket: AggregationsFrequentItemSetsBucketKeys) => ({
              _id: bucket.key,
              count: bucket.doc_count,
            }),
          )
        : [{ totalSets: value.value }];

      return acc;
    },
    {} as ITransformedFullFacets,
  );

  return [transformed];
};
