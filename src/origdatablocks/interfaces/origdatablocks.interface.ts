import {
  IDatafileFilter,
  IFiltersV4,
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

export type IOrigDatablockFiltersV4<T, Y = null> = IFiltersV4<
  T,
  Y,
  OrigDatablockLookupKeysEnum[]
>;
