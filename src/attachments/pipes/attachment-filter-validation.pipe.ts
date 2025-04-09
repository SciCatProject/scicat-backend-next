import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { flattenObject } from "src/common/utils";
import { AttachmentRelationshipClass } from "../schemas/relationship.schema";
import { OutputAttachmentV4Dto } from "../dto/output-attachment.v4.dto";

// Attachment specific keys that are allowed
const ALLOWED_ATTACHMENT_KEYS = [
  ...Object.keys(new OutputAttachmentV4Dto()),
  ...Object.keys(new AttachmentRelationshipClass()),
];

// Allowed keys taken from mongoose QuerySelector.
const ALLOWED_FILTER_KEYS: Record<string, string[]> = {
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

@Injectable()
export class AttachmentFilterValidationPipe
  implements PipeTransform<string, string>
{
  constructor(
    private filters: Record<string, boolean> = {
      where: true,
      include: false,
      fields: true,
      limits: true,
    },
  ) {}
  transform(inValue: string): string {
    const allAllowedKeys: string[] = [...ALLOWED_ATTACHMENT_KEYS];

    for (const key in this.filters) {
      if (this.filters[key]) {
        allAllowedKeys.push(...ALLOWED_FILTER_KEYS[key]);
      }
    }
    const inValueParsed = JSON.parse(inValue ?? "{}");
    const flattenFilterKeys = Object.keys(flattenObject(inValueParsed));

    /*
     * intercept filter and make sure we only allow accepted values
     */
    flattenFilterKeys.forEach((key) => {
      const keyParts = key.split(".");
      const isInAllowedKeys = keyParts.every((part) =>
        allAllowedKeys.includes(part),
      );
      if (!isInAllowedKeys) {
        throw new BadRequestException(
          `Property ${key} should not exist in the filter object`,
        );
      }
    });

    return inValue;
  }
}
