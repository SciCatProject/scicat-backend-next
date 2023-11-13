import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { IFilter } from "../interfaces/es-common.type";

export const transformKey = (key: string): string => {
  return key.trim().replace(/[.]/g, "\\.").replace(/ /g, "_").toLowerCase();
};
export const transformKeysInObject = (obj: Record<string, unknown>) => {
  const newObj: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = transformKey(key);

    const isNumberValueType = Number.isInteger(
      (value as Record<string, unknown>)?.value,
    );
    if (isNumberValueType) {
      (value as Record<string, unknown>)["value_type"] = "number";
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
          : [transformdKey, value];
      })
    : [];
  const modifiedDocInObject = {
    ...obj,
    scientificMetadata:
      modifedDocInArray.length > 0 ? Object.fromEntries(modifedDocInArray) : {},
  };

  return modifiedDocInObject;
};

export const convertToElasticSearchQuery = (
  scientificQuery: Record<string, unknown>,
) => {
  const filters: IFilter[] = [];

  for (const field in scientificQuery) {
    const query = scientificQuery[field] as Record<string, unknown>;
    const operation = Object.keys(query)[0];
    const value = query[operation];
    const esOperation = operation.replace("$", "");

    // Example: trasnformedKey = "scientificMetadata.someKey.value"
    // firstPart = "scientificMetadata" , middlePart = "someKey"
    const { transformedKey, firstPart, middlePart } = transformMiddleKey(field);

    let filter = {};

    // NOTE: if value is a number, add a custom number filter
    if (typeof value === "number") {
      const numberFilter = {
        term: { [`${firstPart}.${middlePart}.value_type`]: "number" },
      };
      filters.push(numberFilter);
    }

    filter =
      esOperation === "eq"
        ? {
            term: { [`${transformedKey}`]: value },
          }
        : { range: { [`${transformedKey}`]: { [esOperation]: value } } };

    filters.push(filter);
  }

  return filters;
};
