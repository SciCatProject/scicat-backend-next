import { Logger } from "@nestjs/common";
import { DateTime } from "luxon";
import { format, unit } from "mathjs";
import { IAxiosError, IScientificFilter } from "./interfaces/common.interface";
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

export const appendSIUnitToPhysicalQuantity = <T>(object: T) => {
  let updatedObject = {} as T;
  Object.keys(object).forEach((key) => {
    const instance = object[key as keyof T] as T[keyof T];
    let value: number | undefined;
    let unit: string | undefined;
    if (instance) {
      Object.keys(instance).forEach((scientificKey) => {
        if (scientificKey.startsWith("u") && !scientificKey.endsWith("SI")) {
          unit = instance[
            scientificKey as keyof T[keyof T]
          ] as unknown as string;
        }
        if (scientificKey.startsWith("v") && !scientificKey.endsWith("SI")) {
          value = instance[
            scientificKey as keyof T[keyof T]
          ] as unknown as number;
        }
      });

      if (value !== undefined && unit && unit.length > 0) {
        const { valueSI, unitSI } = convertToSI(value, unit);
        updatedObject[key as keyof T] = {
          ...instance,
          valueSI,
          unitSI,
        };
      }
      // Has nested field
      else if (isObject(instance)) {
        updatedObject = {
          ...updatedObject,
          [key]: appendSIUnitToPhysicalQuantity(instance),
        };
      } else {
        updatedObject[key as keyof T] = instance;
      }
    }
  });
  return updatedObject;
};

export const convertToRequestedUnit = (
  value: number,
  currentUnit: string,
  requestedUnit: string,
): { valueRequested: number; unitRequested: string } => {
  const converted = unit(value, currentUnit).to(requestedUnit);
  const formatted = format(converted, { precision: 3 }).toString();
  const convertedValue = formatted.substring(0, formatted.indexOf(" "));
  const convertedUnit = formatted.substring(formatted.indexOf(" ") + 1);
  return {
    valueRequested: Number(convertedValue),
    unitRequested: convertedUnit,
  };
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

export const extractMetadataKeys = <T>(
  instances: T[],
  prop: keyof T,
): string[] => {
  const keys = new Set<string>();
  //Return nested keys in this structure parentkey.childkey.grandchildkey....
  const flattenKeys = (object: Record<string, unknown>, keyStr: string) => {
    Object.keys(object).forEach((key) => {
      const value = object[key] as Record<string, unknown>;
      const newKeyStr = `${keyStr ? keyStr + "." : ""}${key}`;
      if (isObject(value)) {
        flattenKeys(value, newKeyStr);
      } else {
        keys.add(newKeyStr);
      }
    });
  };
  instances.forEach((instance) => {
    const propObject = instance[prop] as unknown as Record<string, unknown>;
    flattenKeys(propObject, "");
  });
  return Array.from(keys);
};

export const handleAxiosRequestError = (
  err: unknown,
  context?: string,
): void => {
  const error: IAxiosError = err as IAxiosError;
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    Logger.error(error.response.data, context);
    Logger.error(error.response.status, context);
    Logger.error(error.response.headers, context);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error(error.request);
    Logger.error({ request: error.request }, context);
  } else {
    // Something happened in setting up the request that triggered an Error
    Logger.error("Error: " + error.message, context);
  }
  Logger.verbose(error.config, context);
};

// transform date strings in all fields with key dateKeys to updateTimesToUTC
// do nothing if input values are already UTC

export const updateTimesToUTC = <T>(dateKeys: (keyof T)[], instance: T): T => {
  dateKeys.forEach((key) => {
    if (instance[key]) {
      const dateField = instance[key] as unknown as string;
      instance[key] = DateTime.fromISO(dateField, {
        zone: DateTime.local().zoneName,
      }).toISO() as unknown as T[keyof T];
    }
  });
  return instance;
};

// dito but for array of instances

export const updateAllTimesToUTC = <T>(
  dateKeys: (keyof T)[],
  instances: T[],
): T[] => instances.map((instance) => updateTimesToUTC<T>(dateKeys, instance));
