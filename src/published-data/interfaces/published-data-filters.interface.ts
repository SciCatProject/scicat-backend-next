import { FilterQuery } from "mongoose";
import { PublishedDataDocument } from "../schemas/published-data.schema";

export interface IPublishedDataFilters {
  where?: FilterQuery<PublishedDataDocument>;
  include?: { relation: string }[];
  fields?: {
    status: string;
  };
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}
