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

export interface ICount {
  count: number;
}

export interface IFormPopulateData {
  resourceType?: string;
  description?: string;
  title?: string;
  abstract?: string;
  thumbnail?: string;
}

export interface IRegister {
  doi: string;
}
