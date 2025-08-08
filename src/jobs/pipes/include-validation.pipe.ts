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
      !includeValueParsed.includes("datasets")
    ) {
      throw new BadRequestException(
        `Database filter 'include' must include 'datasets' field as it's the only other collection that can be merged for now. If you need to include other relations based on datasets, add 'datasets' to the query.`,
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
          `Provided include field '${field}' is not part of the job relation but part of dataset relation. Please specify it with 'datasets.${field}'`,
        );
      } else {
        throw new BadRequestException(
          `Provided include field '${field}' is not part of the job or dataset relations`,
        );
      }
    });

    return inValue;
  }
}
