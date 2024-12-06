import { PipelineStage } from "mongoose";

export const DATASET_LOOKUP_FIELDS: Record<
  | "instruments"
  | "proposals"
  | "origdatablocks"
  | "datablocks"
  | "attachments"
  | "samples",
  PipelineStage.Lookup
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
};

export type DatasetLookupKeys = keyof typeof DATASET_LOOKUP_FIELDS;
