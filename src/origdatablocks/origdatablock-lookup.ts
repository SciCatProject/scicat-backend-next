import { PipelineStage } from "mongoose";

export enum OrigDatablockLookupKeysEnum {
  files = "files",
  all = "all",
}

export const ORIGDATABLOCK_LOOKUP_FIELDS: Record<
  OrigDatablockLookupKeysEnum,
  PipelineStage.Lookup | undefined
> = {
  files: {
    $lookup: {
      from: "DataFile",
      localField: "dataFileList",
      foreignField: "_id",
      as: "",
    },
  },
  all: undefined,
};
