import { FilterQuery } from "mongoose";
import { JobDocument } from "../schemas/job.schema";

export enum JobField {
  Text = "text",
  Id = "id",
  EmailJobInitiator = "emailJobInitiator",
  Type = "type",
  CreationTime = "creationTime",
  JobParams = "jobParams",
  JobStatusMessage = "jobStatusMessage",
  DatasetList = "datasetList",
  JobResultObject = "jobResultProject",
}

export interface IJobFilters {
  where?: FilterQuery<JobDocument>;
  fields?: FilterQuery<JobDocument>;
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}

export interface IJobFacets {
  fields?: FilterQuery<JobDocument>;
  facets?: string[];
}
