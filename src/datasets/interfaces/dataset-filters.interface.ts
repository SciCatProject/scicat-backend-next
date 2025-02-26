import { FilterQuery } from "mongoose";
import {
  ILimitsFilter,
  IScientificFilter,
} from "src/common/interfaces/common.interface";
import { DatasetLookupKeysEnum } from "../types/dataset-lookup";

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
  accessGroups?: string[];
  keywords?: string[];
  isPublished?: boolean;
  scientific?: IScientificFilter[];
  metadataKey?: string;
  _id?: string;
  userGroups?: string[];
  sharedWith?: string[];
  [key: string]: unknown;
}

export interface IDatasetFiltersV4<T, Y = null> {
  where?: FilterQuery<T>;
  include?: DatasetLookupKeysEnum[];
  fields?: Y;
  limits?: ILimitsFilter;
}
