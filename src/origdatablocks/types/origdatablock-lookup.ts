import { PipelineStage } from "mongoose";
import { OrigDatablock } from "../schemas/origdatablock.schema";
import { DataFile } from "src/common/schemas/datafile.schema";

export enum OrigDatablockLookupKeysEnum {
  dataset = "dataset",
  all = "all",
}

export const ORIGDATABLOCK_LOOKUP_FIELDS: Record<
  OrigDatablockLookupKeysEnum,
  PipelineStage.Lookup | undefined
> = {
  dataset: {
    $lookup: {
      from: "Dataset",
      as: "",
      let: { datasetId: "$datasetId" },
      pipeline: [{ $match: { $expr: { $eq: ["$pid", "$$datasetId"] } } }],
    },
  },
  all: undefined,
};

// OrigDatablock specific keys that are allowed
export const ALLOWED_ORIGDATABLOCK_KEYS = [
  ...Object.keys(new OrigDatablock()),
  ...Object.keys(new DataFile()),
];

// Allowed keys taken from mongoose QuerySelector.
export const ALLOWED_ORIGDATABLOCK_FILTER_KEYS: Record<string, string[]> = {
  where: [
    "where",
    "$in",
    "$or",
    "$and",
    "$nor",
    "$match",
    "$eq",
    "$gt",
    "$gte",
    "$lt",
    "$lte",
    "$ne",
    "$nin",
    "$not",
    "$exists",
    "$regex",
    "$options",
  ],
  include: ["include"],
  limits: ["limits", "limit", "skip", "sort"],
  fields: ["fields"],
};
