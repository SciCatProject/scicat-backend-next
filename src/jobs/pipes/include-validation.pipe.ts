import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { isJsonString } from "src/common/utils";
import { JOB_LOOKUP_FIELDS } from "src/jobs/types/job-lookup";
import { DATASET_LOOKUP_FIELDS } from "src/datasets/types/dataset-lookup";

@Injectable()
export class IncludeValidationPipe
  implements PipeTransform<string | string[], string | string[]>
{
  transform(inValue: string | string[]): string[] | string {
    if (!inValue) {
      return inValue;
    }

    const isArray = Array.isArray(inValue);
    const includeValueParsed: string[] = isArray
      ? inValue
      : isJsonString(inValue)
        ? JSON.parse(inValue ?? "{}").include
        : Array(inValue);

    if (
      includeValueParsed &&
      includeValueParsed.length > 0 &&
      !includeValueParsed.includes("datasets") &&
      !includeValueParsed.includes("all")
    ) {
      throw new BadRequestException(
        `The 'include' filter must contain 'datasets' — it’s currently the only collection that can be merged. To include related data, add 'datasets' to your query.`,
      );
    }
    includeValueParsed?.map((field) => {
      if (Object.keys(JOB_LOOKUP_FIELDS).includes(field)) {
        return field;
      } else if (
        field.startsWith("datasets.") &&
        Object.keys(DATASET_LOOKUP_FIELDS).includes(
          field.replace("datasets.", ""),
        )
      ) {
        return field;
      } else if (
        Object.keys(DATASET_LOOKUP_FIELDS).includes(
          field.replace("datasets.", ""),
        )
      ) {
        throw new BadRequestException(
          `Invalid include field '${field}': provided reation is a dataset relation. Please specify it with 'datasets.${field}'`,
        );
      } else {
        throw new BadRequestException(
          `Invalid include field '${field}': not an allowed relation or creates a cyclic join (e.g., 'datasets.datablocks.datasets').`,
        );
      }
    });

    return inValue;
  }
}
