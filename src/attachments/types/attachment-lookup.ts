import { PipelineStage } from "mongoose";
import { AttachmentRelationshipsV4Dto } from "../dto/attachment-relationships.v4.dto";
import { OutputAttachmentV4Dto } from "../dto/output-attachment.v4.dto";

export enum AttachmentLookupKeysEnum {}

export const ATTACHMENT_LOOKUP_FIELDS: Record<
  AttachmentLookupKeysEnum,
  PipelineStage.Lookup | undefined
> = {};

// Attachment specific keys that are allowed
export const ALLOWED_ATTACHMENT_KEYS = [
  ...Object.keys(new OutputAttachmentV4Dto()),
  ...Object.keys(new AttachmentRelationshipsV4Dto()),
];

// Allowed keys taken from mongoose QuerySelector.
export const ALLOWED_ATTACHMENT_FILTER_KEYS: Record<string, string[]> = {
  where: [
    "where",
    "$in",
    "$or",
    "$and",
    "$nor",
    "$match",
    "$eq",
    "$gt",
    "$gte",
    "$lt",
    "$lte",
    "$ne",
    "$nin",
    "$not",
    "$exists",
    "$regex",
    "$options",
    "$elemMatch",
  ],
  include: [],
  limits: ["limits", "limit", "skip", "sort"],
  fields: ["fields"],
};
