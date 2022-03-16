import { FilterQuery } from "mongoose";
import { IScientificFilter } from "src/common/interfaces/common.interface";
import { DatasetDocument } from "../schemas/dataset.schema";

export interface IDatasetFields {
  mode?: Record<string, unknown>;
  text?: string;
  creationTime?: {
    begin: string;
    end: string;
  };
  type?: string[];
  creationLocation?: string[];
  ownerGroup?: string[];
  keywords?: string[];
  isPublished?: boolean;
  scientific?: IScientificFilter[];
  metadataKey?: string;
  _id?: string;
  userGroups?: string[];
  [key: string]: unknown;
}

export interface IDatasetFilters {
  where?: FilterQuery<DatasetDocument>;
  include?: { relation: string }[];
  fields?: IDatasetFields;
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}

export interface IDatasetFacets {
  fields?: IDatasetFields;
  facets?: string[];
}
