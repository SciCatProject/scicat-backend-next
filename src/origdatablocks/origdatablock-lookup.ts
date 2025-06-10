import { PipelineStage } from "mongoose";

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
      localField: "datasetId",
      foreignField: "pid",
      as: "",
    },
  },
  all: undefined,
};
