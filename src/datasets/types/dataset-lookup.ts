import { PipelineStage } from "mongoose";

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
