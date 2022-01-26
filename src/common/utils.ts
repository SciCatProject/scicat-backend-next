import { unit } from "mathjs";
import { DerivedDataset } from "src/datasets/schemas/derived-dataset.schema";
import { RawDataset } from "src/datasets/schemas/raw-dataset.schema";
import { IScientificFilter } from "./interfaces/common.interface";
import { ScientificRelation } from "./scientific-relation.enum";

export const convertToSI = (
  inputValue: number,
  inputUnit: string,
): { valueSI: number; unitSI: string } => {
  try {
    const quantity = unit(inputValue, inputUnit).toSI().toJSON();
    return { valueSI: Number(quantity.value), unitSI: quantity.unit };
  } catch (error) {
    console.error(error);
    return { valueSI: inputValue, unitSI: inputUnit };
  }
};

export const mapScientificQuery = (
  scientific: IScientificFilter[],
): Record<string, unknown> => {
  const scientificFilterQuery: Record<string, unknown> = {};

  scientific.forEach((scientificFilter) => {
    const { lhs, relation, rhs, unit } = scientificFilter;
    const matchKeyGeneric = `scientificMetadata.${lhs}`;
    const matchKeyMeasurement = `scientificMetadata.${lhs}.valueSI`;
    const matchUnit = `scientificMetadata.${lhs}.unitSI`;

    switch (relation) {
      case ScientificRelation.EQUAL_TO_STRING: {
        scientificFilterQuery[`${matchKeyGeneric}.value`] = { $eq: rhs };
        break;
      }
      case ScientificRelation.EQUAL_TO_NUMERIC: {
        if (unit && unit.length > 0) {
          const { valueSI, unitSI } = convertToSI(Number(rhs), unit);
          scientificFilterQuery[matchKeyMeasurement] = { $eq: valueSI };
          scientificFilterQuery[matchUnit] = { $eq: unitSI };
        } else {
          scientificFilterQuery[`${matchKeyGeneric}.value`] = { $eq: rhs };
        }
        break;
      }
      case ScientificRelation.GREATER_THAN: {
        if (unit && unit.length > 0) {
          const { valueSI, unitSI } = convertToSI(Number(rhs), unit);
          scientificFilterQuery[matchKeyMeasurement] = { $gt: valueSI };
          scientificFilterQuery[matchUnit] = { $eq: unitSI };
        } else {
          scientificFilterQuery[`${matchKeyGeneric}.value`] = { $gt: rhs };
        }
        break;
      }
      case ScientificRelation.LESS_THAN: {
        if (unit && unit.length > 0) {
          const { valueSI, unitSI } = convertToSI(Number(rhs), unit);
          scientificFilterQuery[matchKeyMeasurement] = { $lt: valueSI };
          scientificFilterQuery[matchUnit] = { $eq: unitSI };
        } else {
          scientificFilterQuery[`${matchKeyGeneric}.value`] = { $lt: rhs };
        }
        break;
      }
    }
  });

  return scientificFilterQuery;
};

/**Check if input is object or a physical quantity */
const isObject = (x: unknown) => {
  if (
    x &&
    typeof x === "object" &&
    !Array.isArray(x) &&
    !(x as Record<string, unknown>).unit &&
    (x as Record<string, unknown>).unit !== "" &&
    !(x as Record<string, unknown>).u &&
    (x as Record<string, unknown>).u !== ""
  ) {
    return true;
  }
  return false;
};

export const extractMetadataKeys = (datasets: unknown[]): string[] => {
  const keys = new Set<string>();
  //Return nested keys in this structure parentkey.childkey.grandchildkey....
  const flattenKeys = (object: Record<string, unknown>, keyStr: string) => {
    Object.keys(object).forEach((key) => {
      const value = object[key];
      const newKeyStr = `${keyStr ? keyStr + "." : ""}${key}`;
      if (isObject(value)) {
        flattenKeys(value as Record<string, unknown>, newKeyStr);
      } else {
        keys.add(newKeyStr);
      }
    });
  };
  datasets.forEach((dataset) => {
    if (dataset instanceof RawDataset && dataset.scientificMetadata) {
      const scientificMetadata = dataset.scientificMetadata;
      flattenKeys(scientificMetadata, "");
    }
    if (dataset instanceof DerivedDataset && dataset.scientificMetadata) {
      const scientificMetadata = dataset.scientificMetadata;
      flattenKeys(scientificMetadata, "");
    }
  });
  return Array.from(keys);
};
