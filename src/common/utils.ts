/* eslint-disable @typescript-eslint/quotes */
import { Logger } from "@nestjs/common";
import { DateTime } from "luxon";
import { format, unit } from "mathjs";
import { Expression, FilterQuery, Model, PipelineStage } from "mongoose";
import { DatasetType } from "src/datasets/dataset-type.enum";
import {
  IAxiosError,
  IFilters,
  ILimitsFilter,
  IScientificFilter,
} from "./interfaces/common.interface";
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

export const appendSIUnitToPhysicalQuantity = <T extends object>(object: T) => {
  let updatedObject = {} as T;
  Object.keys(object).forEach((key) => {
    const instance = object[key as keyof T] as T[keyof T];
    let value: number | undefined;
    let unit: string | undefined;
    if (!instance) {
      updatedObject[key as keyof T] = instance;
      return;
    }
    Object.keys(instance).forEach((scientificKey) => {
      if (scientificKey.startsWith("u") && !scientificKey.endsWith("SI")) {
        unit = instance[scientificKey as keyof T[keyof T]] as unknown as string;
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
  scientific: IScientificFilter[] = [],
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
    if (instance[prop]) {
      const propObject = instance[prop] as unknown as Record<string, unknown>;
      flattenKeys(propObject, "");
    }
  });
  return Array.from(keys);
};

export const flattenObject = <T>(obj: T) => {
  const result: Record<string, unknown> = {};

  for (const i in obj) {
    if (typeof obj[i] === "object" && !Array.isArray(obj[i])) {
      const temp = flattenObject(obj[i]);
      for (const j in temp) {
        result[i + "." + j] = temp[j];
      }
    } else {
      result[i] = obj[i];
    }
  }
  return result;
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
        zone: DateTime.local().zoneName as string,
      }).toISO() as unknown as T[keyof T];
    }
  });
  return instance;
};

// dito but for array of instances

export const updateAllTimesToUTC = <T>(
  dateKeys: (keyof T)[],
  instances: T[],
): T[] => {
  return instances
    ? instances.map((instance) => updateTimesToUTC<T>(dateKeys, instance))
    : [];
};

export const parseLimitFilters = (
  limits: ILimitsFilter | undefined,
): {
  limit: number;
  skip: number;
  sort: { [key: string]: "asc" | "desc" } | string;
} => {
  if (!limits) {
    return { limit: 100, skip: 0, sort: "" };
  }
  const limit = limits.limit ? limits.limit : 100;
  const skip = limits.skip ? limits.skip : 0;
  let sort: { [key: string]: "asc" | "desc" } | string = "";
  if (limits.order) {
    const [field, direction] = limits.order.split(":");
    if (direction === "asc" || direction === "desc") {
      sort = { [field]: direction as "asc" | "desc" };
    }
  }
  return { limit, skip, sort };
};

export const parseLimitFiltersForPipeline = (
  limits: ILimitsFilter | undefined,
): PipelineStage[] => {
  const pipelineStages: PipelineStage[] = [];

  if (!limits) {
    pipelineStages.push({ $skip: 0 }, { $limit: 100 });
  } else {
    const { limit = 100, skip = 0, order } = limits;

    pipelineStages.push({ $skip: skip }, { $limit: limit });

    if (order) {
      const [field, direction] = order.split(":");
      if (direction === "asc" || direction === "desc") {
        // NOTE string val of "asc" & "desc" is not supported for aggregate pipeline
        const sortIntVal = direction === "asc" ? 1 : -1;
        pipelineStages.unshift({ $sort: { [field]: sortIntVal } });
      }
    }
  }

  return pipelineStages;
};

export const createNewFacetPipelineStage = (
  name: string,
  type: string,
  query: Record<string, unknown>,
): PipelineStage[] => {
  const pipeline: PipelineStage[] = [];

  if (type === "Array") {
    pipeline.push({
      $unwind: "$" + name,
    });
  }

  if (query && Object.keys(query).length > 0) {
    const queryCopy = { ...query };
    delete queryCopy[name];

    if (Object.keys(queryCopy).length > 0) {
      pipeline.push({
        $match: queryCopy as Record<string, Expression>,
      });
    }
  }

  const group: {
    $group: {
      _id: string | Record<string, unknown>;
      count: Record<string, number>;
    };
  } = {
    $group: {
      _id: "$" + name,
      count: {
        $sum: 1,
      },
    },
  };

  if (type === "Date") {
    group.$group._id = {
      year: {
        $year: "$" + name,
      },
      month: {
        $month: "$" + name,
      },
      day: {
        $dayOfMonth: "$" + name,
      },
    };
  }
  pipeline.push(group);

  const sort: PipelineStage.Sort = {
    $sort: {
      _id: -1,
    },
  };
  pipeline.push(sort);

  return pipeline;
};

export const schemaTypeOf = <T>(
  model: Model<
    T,
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  key: string,
  value: unknown = null,
): string => {
  let property = model.schema.path(key);

  if (typeof model.discriminators !== "undefined") {
    if (!property) {
      property = model.discriminators[DatasetType.Raw].schema.path(key);
    }

    if (!property) {
      property = model.discriminators[DatasetType.Derived].schema.path(key);
    }
  }

  if (!property) {
    if (value && "begin" in (value as Record<string, unknown>)) {
      return "Date";
    }
    return "String";
  }

  return property.instance;
};

export const searchExpression = <T>(
  model: Model<
    T,
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  fieldName: string,
  value: unknown,
): unknown => {
  if (fieldName === "text") {
    return { $search: value };
  }

  const valueType = schemaTypeOf<T>(model, fieldName, value);

  if (valueType === "String") {
    if (Array.isArray(value)) {
      if (value.length == 1) {
        return value[0];
      } else {
        return {
          $in: value,
        };
      }
    } else {
      return value;
    }
  } else if (valueType === "Date") {
    return {
      $gte: new Date((value as Record<string, string | Date>).begin),
      $lte: new Date((value as Record<string, string | Date>).end),
    };
  } else if (valueType === "Boolean") {
    return {
      $eq: value,
    };
  } else if (Array.isArray(value)) {
    return {
      $in: value,
    };
  } else {
    return value;
  }
};

export const createFullqueryFilter = <T>(
  model: Model<
    T,
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  idField: keyof T,
  fields: FilterQuery<T> = {},
): FilterQuery<T> => {
  let filterQuery: FilterQuery<T> = {};

  Object.keys(fields).forEach((key) => {
    if (key === "mode") {
      const currentExpression = JSON.parse(JSON.stringify(fields[key]));
      if (idField in currentExpression) {
        currentExpression["_id"] = currentExpression[idField];
        delete currentExpression[idField];
      }
      filterQuery = { ...filterQuery, ...currentExpression };
    } else if (key === "text") {
      filterQuery.$text = searchExpression<T>(
        model,
        key,
        fields[key],
      ) as typeof filterQuery.$text;
    } else if (key === "scientific" || key === "sampleCharacteristics") {
      filterQuery = {
        ...filterQuery,
        ...mapScientificQuery(fields[key]),
      };
    } else if (key === "userGroups") {
      filterQuery["$or"] = [
        {
          ownerGroup: searchExpression<T>(model, "ownerGroup", fields[key]),
        },
        {
          accessGroups: searchExpression<T>(model, "accessGroups", fields[key]),
        },
      ];
    } else if (key === "sharedWith") {
      filterQuery["$or"]?.push({
        sharedWith: searchExpression<T>(model, "sharedWith", fields[key]),
      });
    } else {
      filterQuery[key as keyof FilterQuery<T>] = searchExpression<T>(
        model,
        key,
        fields[key],
      );
    }
  });

  return filterQuery;
};

export const createFullfacetPipeline = <T, Y extends object>(
  model: Model<
    T,
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  idField: keyof T,
  fields: Y,
  facets: string[],
  subField = "",
): PipelineStage[] => {
  const pipeline = [];
  const facetMatch: Record<string, unknown> = {};

  Object.keys(fields).forEach((key) => {
    if (facets.indexOf(key) < 0) {
      if (key === "text") {
        if (typeof fields[key as keyof Y] === "string") {
          const match = {
            $match: {
              $or: [
                {
                  $text: searchExpression<T>(
                    model,
                    key,
                    fields[key as keyof Y],
                  ),
                },
              ],
            },
          };
          pipeline.unshift(match);
        }
      } else if (key === idField) {
        const match = {
          $match: {
            [idField]: searchExpression<T>(model, key, fields[key as keyof Y]),
          },
        };
        pipeline.push(match);
      } else if (key === "mode") {
        // substitute potential id field in fields
        const currentExpression = JSON.parse(
          JSON.stringify(fields[key as keyof Y]),
        );
        if (idField in currentExpression) {
          currentExpression["_id"] = currentExpression[idField];
          delete currentExpression[idField];
        }
        const match = {
          $match: currentExpression,
        };

        pipeline.push(match);
      } else if (key === "userGroups") {
        if (
          fields[key as keyof Y] &&
          (fields[key as keyof Y] as unknown as string[]).indexOf(
            "globalaccess",
          ) < 0 &&
          "ownerGroup" in model.schema.paths
        ) {
          const match = {
            $match: {
              $or: [
                {
                  ownerGroup: searchExpression<T>(
                    model,
                    "ownerGroup",
                    fields[key as keyof Y],
                  ),
                },
                {
                  accessGroups: searchExpression<T>(
                    model,
                    "accessGroups",
                    fields[key as keyof Y],
                  ),
                },
              ],
            },
          };
          pipeline.push(match);
        }
      } else if (key === "scientific" || key === "sampleCharacteristics") {
        const match = {
          $match: mapScientificQuery(
            fields[key as keyof Y] as unknown as IScientificFilter[],
          ),
        };
        pipeline.push(match);
      } else {
        const match: Record<string, unknown> = {};
        match[key] = searchExpression<T>(model, key, fields[key as keyof Y]);
        const m = {
          $match: match,
        };
        pipeline.push(m);
      }
    } else {
      facetMatch[key] = searchExpression<T>(model, key, fields[key as keyof Y]);
    }
  });

  const facetObject: Record<string, PipelineStage[]> = {};
  facets.forEach((facet) => {
    if (typeof model.schema.discriminators !== "undefined") {
      if (facet in model.schema.discriminators[DatasetType.Raw].paths) {
        facetObject[facet] = createNewFacetPipelineStage(
          facet,
          schemaTypeOf<T>(model, facet),
          facetMatch,
        );
        return;
      } else if (
        facet in model.schema.discriminators[DatasetType.Derived].paths
      ) {
        facetObject[facet] = createNewFacetPipelineStage(
          facet,
          schemaTypeOf<T>(model, facet),
          facetMatch,
        );
        return;
      }
    } else if (facet in model.schema.paths) {
      facetObject[facet] = createNewFacetPipelineStage(
        facet,
        schemaTypeOf<T>(model, facet),
        facetMatch,
      );
      return;
    }

    if (facet.startsWith("datasetlifecycle.")) {
      const lifecycleFacet = facet.split(".")[1];
      facetObject[lifecycleFacet] = createNewFacetPipelineStage(
        lifecycleFacet,
        schemaTypeOf<T>(model, lifecycleFacet),
        facetMatch,
      );
      return;
    } else {
      Logger.warn(
        `Warning: Facet not part of any model: ${facet}`,
        "utils.createFullfacetPipeline",
      );
    }
  });

  facetObject["all"] = [
    {
      $match: facetMatch as Record<string, Expression>,
    },
  ];

  if (subField) {
    facetObject["all"].push({
      $unwind: "$" + subField,
    });
  }

  facetObject["all"].push({
    $count: "totalSets",
  });
  pipeline.push({ $facet: facetObject });

  return pipeline as PipelineStage[];
};

export const addCreatedByFields = <T>(
  obj: T,
  username: string,
): T & {
  createdBy: string;
  updatedBy: string;
} => {
  return {
    ...obj,
    createdBy: username,
    updatedBy: username,
  };
};

export const addUpdatedByField = <T>(
  obj: T,
  username: string,
): T & {
  updatedBy: string;
} => {
  return {
    ...obj,
    updatedBy: username,
  };
};

export const filterExample =
  '{ "where": { "field": "value" }, "include": [ { "relation": "target" } ], "fields": ["field1", "field2"], "limits": {"limit": 1, "skip": 1, "order": "asc"}}';

export const filterDescription =
  '<pre>\n \
{\n \
  "where?": {\n \
    "field": "value"\n \
  },\n \
  "include?": [\n \
    {\n \
      "relation": "target",\n \
      "scope": {\n \
        "where" : "<where_condition>"\n \
      ]\n \
    }\n \
  ],\n \
  "fields?": [ "field1", "field2", ...],\n \
  "limits?": {\n \
    "limit": number,\n \
    "skip": number,\n \
    "order": [ascending, descending]\n \
  }\n \
}\n \
</pre>';

export const fullQueryExampleLimits =
  '{"limit": 1, "skip": 1, "order": "creationTime:desc"}';

export const datasetsFullQueryExampleFields =
  '{"mode":{},"ownerGroup":["group1"],"scientific":[{"lhs":"sample","relation":"EQUAL_TO_STRING","rhs":"my sample"},{"lhs":"temperature","relation":"GREATER_THAN","rhs":10,"unit":"celsius"}]}';

export const fullQueryDescriptionLimits =
  '<pre>\n \
{\n \
  "limit": number,\n \
  "skip": number,\n \
  "order": [ascending, descending]\n \
}\n \
</pre>';

export const datasetsFullQueryDescriptionFields =
  '<pre>\n  \
{\n \
  "mode":{\n \
    "key": "value",\n \
  },\n \
  "text": string, <optional>\n \
  "creationTime": { <optional>\n \
    "begin": string,\n \
    "end": string,\n \
  },\n \
  "type": ["type1", ...], <optional>\n \
  "creationLocation": ["creationLocation1", ...], <optional>\n \
  "ownerGroup": ["group1", ...], <optional>\n \
  "keywords": ["keyword1", ...], <optional>\n \
  "isPublished: boolean,  <optional>\n \
  "scientific": [ <optional>\n \
    {\n \
      "lhs":<metadata_key>>,\n \
      "relation":["EQUAL_TO_STRING","EQUAL_TO_NUMERIC","GREATER_THAN","LESS_THAN"],\n \
      "rhs":<metadata_value>,\n \
      "unit":<unit>,\n \
    },\n \
    ...\n \
  ],\n \
  "metadataKey": "metadata", <optional>\n \
  "_id": "item id", <optional>\n \
  "userGroups": ["group1", ...], <optional>\n \
  "sharedWith": "email", <optional>\n \
}\n \
  </pre>';

export const proposalsFullQueryExampleFields =
  '{"text": "some text", "proposalId": "proposal_id"}';

export const proposalsFullQueryDescriptionFields =
  '<pre>\n \
{\n \
  "text": string, <optional>\n \
  "startTime": { <optional>\n \
    "begin": string,\n \
    "end": string,\n \
  },\n \
  "proposalId": { "regex": string, "options": string }, <optional>\n \
  "title": { "regex": string, "options": string }, <optional>\n \
  "firstname": { "regex": string, "options": string }, <optional>\n \
  "lastname": { "regex": string, "options": string }, <optional>\n \
  "endTime": { <optional>\n \
    "begin": string,\n \
    "end": string,\n \
  },\n \
  "userGroups": ["group1", ...],\n \
}\n \
  </pre>';

export const samplesFullQueryExampleFields =
  '{"text": "some text", "metadataKey": "key", "characteristics": [{"lhs":"material","relation":"EQUAL_TO_STRING","rhs":"my material"}]}';

export const samplesFullQueryDescriptionFields =
  '<pre>\n \
{\n \
  "text": string, <optional>\n \
  "metadataKey": string, <optional>\n \
  "charactersitics": [ <optional>\n \
    {\n \
      "lhs":<property>>,\n \
      "relation":["EQUAL_TO_STRING","EQUAL_TO_NUMERIC","GREATER_THAN","LESS_THAN"],\n \
      "rhs":<value>,\n \
      "unit":<unit>,\n \
    },\n \
    ...\n \
  ],\n \
}\n \
  </pre>';

export const parseBoolean = (v: unknown): boolean => {
  switch (v) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
};

export const replaceLikeOperator = <T>(filter: IFilters<T>): IFilters<T> => {
  if (filter.where) {
    filter.where = replaceLikeOperatorRecursive(
      filter.where as Record<string, unknown>,
    );
  }
  return filter;
};

const replaceLikeOperatorRecursive = (
  input: Record<string, unknown>,
): Record<string, unknown> => {
  const output = {} as Record<string, unknown>;
  for (const k in input) {
    if (k == "like" && typeof input[k] !== "object") {
      // we have encountered a loopback operator like
      output["$regex"] = input[k];
    } else if (k == "$or" || k == "$and" || k == "$in") {
      output[k] = (input[k] as Array<unknown>).map((v) =>
        typeof v === "string"
          ? v
          : replaceLikeOperatorRecursive(v as Record<string, unknown>),
      );
    } else if (typeof input[k] === "object") {
      output[k] = replaceLikeOperatorRecursive(
        input[k] as Record<string, unknown>,
      );
    } else {
      output[k] = input[k];
    }
  }

  return output;
};

export const isObjectWithOneKey = (obj: object): boolean => {
  const keys = Object.keys(obj);
  return keys.length === 1;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
