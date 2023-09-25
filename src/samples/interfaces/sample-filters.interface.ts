import { IScientificFilter } from "src/common/interfaces/common.interface";

export interface ISampleFields {
  text?: string;
  metadataKey?: string;
  characteristics: IScientificFilter[];
}
