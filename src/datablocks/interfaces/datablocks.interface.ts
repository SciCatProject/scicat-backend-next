import { IDatafileFilter } from "src/common/interfaces/common.interface";

export interface IDatablockFields {
  datasetId?: string;
  archiveId?: string;
  size?: {
    min?: string;
    max?: string;
  };
  packedSize?: {
    min?: string;
    max?: string;
  };
  dataFilelist: IDatafileFilter[];
}
