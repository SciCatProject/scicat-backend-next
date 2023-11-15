import { IDatafileFilter } from "src/common/interfaces/common.interface";

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
