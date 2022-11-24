import { DataFile } from "src/common/schemas/datafile.schema";

export interface IDatasetList {
  pid: string;
  files: DataFile[];
}
