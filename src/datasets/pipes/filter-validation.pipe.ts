import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { flattenObject } from "src/common/utils";
import { OutputDatasetDto } from "src/datasets/dto/output-dataset.dto";

// Dataset specific keys that are allowed
const ALLOWED_DATASET_KEYS = Object.keys(new OutputDatasetDto());

const ALLOWED_LIMIT_KEYS = ["limits", "limit", "skip", "sort"];
// Allowed keys taken from mongoose QuerySelector.
const ALLOWED_FILTER_KEYS = [
  "where",
  "include",
  "fields",
  "$in",
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
];

@Injectable()
export class FilterValidationPipe implements PipeTransform<string, string> {
  constructor(private includeLimits = true) {}
  transform(inValue: string): string {
    const allAllowedKeys = this.includeLimits
      ? [...ALLOWED_DATASET_KEYS, ...ALLOWED_FILTER_KEYS, ...ALLOWED_LIMIT_KEYS]
      : [...ALLOWED_DATASET_KEYS, ...ALLOWED_FILTER_KEYS];
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
