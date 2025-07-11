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
        pipeline: [
        ],
      },
    },
  ],
//   datablocks: [
//   {
//     $lookup: {
//       from: "Datablock",
//       localField: "datasetIds", // or adjust based on your job structure
//       foreignField: "datasetId",
//       as: "datablocks"
//     }
//   }
// ]

  
};
