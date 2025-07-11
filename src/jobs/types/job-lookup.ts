import { PipelineStage } from "mongoose";

export enum JobLookupKeysEnum {
  datasets = "datasets",
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
};
