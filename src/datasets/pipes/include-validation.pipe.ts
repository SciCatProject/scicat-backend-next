import { PipeTransform, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { DATASET_LOOKUP_FIELDS } from "src/datasets/types/dataset-lookup";

function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
}

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

    includeValueParsed?.map((field) => {
      if (Object.keys(DATASET_LOOKUP_FIELDS).includes(field)) {
        return field;
      } else {
        throw new BadRequestException(
          `Provided include field ${JSON.stringify(field)} is not part of the dataset relations`,
        );
      }
    });

    return inValue;
  }
}
