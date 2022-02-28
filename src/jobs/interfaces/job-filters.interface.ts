import { FilterQuery } from "mongoose";
import { JobDocument } from "../schemas/job.schema";

export interface IJobFilters {
  where?: FilterQuery<JobDocument>;
  fields?: Record<string, unknown>;
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}
