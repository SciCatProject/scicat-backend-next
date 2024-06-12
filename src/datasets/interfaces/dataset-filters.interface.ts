import { IScientificFilter } from "src/common/interfaces/common.interface";

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
