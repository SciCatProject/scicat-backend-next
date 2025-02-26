import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { flattenObject } from "src/common/utils";
import { OutputDatasetDto } from "src/datasets/dto/output-dataset.dto";

// Dataset specific keys that are allowed
const ALLOWED_DATASET_KEYS = Object.keys(new OutputDatasetDto());

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
  ],
  include: ["include"],
  limits: ["limits", "limit", "skip", "sort"],
  fields: ["fields"],
};

@Injectable()
export class FilterValidationPipe implements PipeTransform<string, string> {
  constructor(
    private filters: Record<string, boolean> = {
      where: true,
      include: true,
      fields: true,
      limits: true,
    },
  ) {}
  transform(inValue: string): string {
    const allAllowedKeys: string[] = [...ALLOWED_DATASET_KEYS];
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
        // TODO: Should we clean the filter or throw bad request error???!!!
        // unset(inValueParsed, key);
        throw new BadRequestException(
          `Property ${key} should not exist in the filter object`,
        );
      }
    });

    return JSON.stringify(inValueParsed);
  }
}
