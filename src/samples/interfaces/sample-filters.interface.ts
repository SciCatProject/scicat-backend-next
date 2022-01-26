import { FilterQuery } from "mongoose";
import { IScientificFilter } from "src/common/interfaces/common.interface";
import { SampleDocument } from "../schemas/sample.schema";

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
  where?: FilterQuery<SampleDocument>;
  include?: { relation: string }[];
  fields?: ISampleFields;
  limits?: {
    skip: number;
    limit: number;
    order: string;
  };
}
