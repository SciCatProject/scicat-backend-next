import { IScientificFilter } from "src/common/interfaces/common.interface";

export enum SampleField {
  Text = "text",
  MetadataKey = "metadataKey",
  Characteristics = "characteristics",
}

export interface ISampleFields {
  text?: string;
  metadataKey?: string;
  characteristics: IScientificFilter[];
}

export interface ISampleFilters {
  fields?: ISampleFields;
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}
