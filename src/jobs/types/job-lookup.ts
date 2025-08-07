import { PipelineStage } from "mongoose";
import { OutputJobDto } from "../dto/output-job-v4.dto";
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
        pipeline: [],
      },
    },
  ],
};

// Jobs specific keys that are allowed
export const ALLOWED_JOB_KEYS = Object.keys(new OutputJobDto());

// Allowed keys taken from mongoose QuerySelector.
export const ALLOWED_JOB_FILTER_KEYS: Record<string, string[]> = {
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
