import { FilterQuery } from "mongoose";
import {
  ILimitsFilter,
  IDatafileFilter,
} from "src/common/interfaces/common.interface";
import { OrigDatablockLookupKeysEnum } from "../types/origdatablock-lookup";

export interface IOrigDatablockFields {
  datasetId?: string;
  size?: {
    min?: string;
    max?: string;
  };
  dataFilelist: IDatafileFilter[];
  userGroups?: string[];
  ownerGroup?: string[];
  accessGroups?: string[];
  isPublished?: boolean;
}

export interface IOrigDatablockFiltersV4<T, Y = null> {
  where?: FilterQuery<T>;
  include?: OrigDatablockLookupKeysEnum[];
  fields?: Y;
  limits?: ILimitsFilter;
}
