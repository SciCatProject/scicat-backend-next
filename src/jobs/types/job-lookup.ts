import { PipelineStage } from "mongoose";

export enum JobLookupKeysEnum {
  datasets = "datasets",
  // instruments = "instruments",
  // proposals = "proposals",
  // origdatablocks = "origdatablocks",
  // datablocks = "datablocks",
  // attachments = "attachments",
  // samples = "samples",
  // all = "all",
}

export const JOB_LOOKUP_FIELDS: Record<
  JobLookupKeysEnum,
  (PipelineStage.AddFields | PipelineStage.Lookup)[] | undefined
> = {
  datasets: [
    {
    $addFields: {
      datasetIds: {
        $cond: {
          if: { $isArray: "$jobParams.datasetList" },
          then: {
            $map: {
              input: "$jobParams.datasetList",
              as: "item",
              in: "$$item.pid",
            },
          },
          else: [],
        },
      },
    },
  },
  {
    $lookup: {
      from: "Dataset", 
      localField: "datasetIds",
      foreignField: "pid",
      as: "datasets",
    },
  },
  ],
  // instruments: {
  //   $lookup: {
  //     from: "Instrument",
  //     localField: "instrumentIds",
  //     foreignField: "pid",
  //     as: "",
  //   },
  // },
  // proposals: {
  //   $lookup: {
  //     from: "Proposal",
  //     localField: "proposalIds",
  //     foreignField: "proposalId",
  //     as: "",
  //   },
  // },
  // origdatablocks: {
  //   $lookup: {
  //     from: "OrigDatablock",
  //     localField: "pid",
  //     foreignField: "datasetId",
  //     as: "",
  //   },
  // },
  // datablocks: {
  //   $lookup: {
  //     from: "Datablock",
  //     localField: "pid",
  //     foreignField: "datasetId",
  //     as: "",
  //   },
  // },
  // attachments: {
  //   $lookup: {
  //     from: "Attachment",
  //     localField: "pid",
  //     foreignField: "datasetId",
  //     as: "",
  //   },
  // },
  // samples: {
  //   $lookup: {
  //     from: "Sample",
  //     localField: "sampleIds",
  //     foreignField: "sampleId",
  //     as: "",
  //   },
  // },
  // all: undefined,
};
