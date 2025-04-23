import { FilterQuery } from "mongoose";
import { ILimitsFilter } from "src/common/interfaces/common.interface";
import { AttachmentRelationshipsV4Dto } from "../dto/attachment-relationships.v4.dto";

export interface IAttachmentFields {
  aid?: string;
  _id: string;
  thumbnail?: string;
  caption: string;
  relationships?: AttachmentRelationshipsV4Dto[];
  ownerGroup: string;
  accessGroups: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  [key: string]: unknown;
}

export interface IAttachmentFiltersV4<T, Y = null> {
  where?: FilterQuery<T>;
  fields?: Y;
  limits?: ILimitsFilter;
}
