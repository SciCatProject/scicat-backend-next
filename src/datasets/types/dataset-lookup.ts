import { PipelineStage } from "mongoose";
import { OutputDatasetDto } from "src/datasets/dto/output-dataset.dto";

export enum DatasetLookupKeysEnum {
  instruments = "instruments",
  proposals = "proposals",
  origdatablocks = "origdatablocks",
  datablocks = "datablocks",
  attachments = "attachments",
  samples = "samples",
  all = "all",
}

export const DATASET_LOOKUP_FIELDS: Record<
  DatasetLookupKeysEnum,
  PipelineStage.Lookup | undefined
> = {
  instruments: {
    $lookup: {
      from: "Instrument",
      localField: "instrumentIds",
      foreignField: "pid",
      as: "",
    },
  },
  proposals: {
    $lookup: {
      from: "Proposal",
      localField: "proposalIds",
      foreignField: "proposalId",
      as: "",
    },
  },
  origdatablocks: {
    $lookup: {
      from: "OrigDatablock",
      localField: "pid",
      foreignField: "datasetId",
      as: "",
    },
  },
  datablocks: {
    $lookup: {
      from: "Datablock",
      localField: "pid",
      foreignField: "datasetId",
      as: "",
    },
  },
  attachments: {
    $lookup: {
      from: "Attachment",
      localField: "pid",
      foreignField: "datasetId",
      as: "",
    },
  },
  samples: {
    $lookup: {
      from: "Sample",
      localField: "sampleIds",
      foreignField: "sampleId",
      as: "",
    },
  },
  all: undefined,
};

// Dataset specific keys that are allowed
export const ALLOWED_DATASET_KEYS = Object.keys(new OutputDatasetDto());

// Allowed keys taken from mongoose QuerySelector.
export const ALLOWED_DATASET_FILTER_KEYS: Record<string, string[]> = {
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
