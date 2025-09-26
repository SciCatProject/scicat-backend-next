import { IFiltersV4 } from "src/common/interfaces/common.interface";
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

export type IAttachmentFiltersV4<T, Y = null> = Omit<
  IFiltersV4<T, Y>,
  "include"
>;
