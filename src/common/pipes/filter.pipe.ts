import { Injectable, PipeTransform } from "@nestjs/common";
import { isObject } from "lodash";
import {
  transformDeep,
  TransformObjValuesPipe,
} from "src/jobs/pipes/v3-filter.pipe";

/**
 * @class FilterPipe
 * @description
 * A NestJS pipe that converts filter objects or JSON strings into a MongoDB-compatible format.
 *
 * - Recursively transforms all `where` keys at any depth.
 * - For all `where` relatives, replaces operators (`inq`, `nin`, `and`, `or`, `like`, `ilike`) with MongoDB equivalents.
 * - Adds `$options: "i"` for `ilike` to enable case-insensitive regex.
 * - Parses JSON strings if needed and returns the result in the same format (string or object).
 */
@Injectable()
export class FilterPipe
  implements
    PipeTransform<
      { filter?: string; fields?: string } | string,
      { filter?: string; fields?: string } | string
    >
{
  private static readonly replaceOperatorsMap = {
    inq: "$in",
    nin: "$nin",
    and: "$and",
    or: "$or",
    like: "$regex",
    ilike: "$regex",
  };
  private readonly replaceOperatorsPipe: TransformObjValuesPipe;

  constructor() {
    this.replaceOperatorsPipe = new TransformObjValuesPipe({
      where: (value: unknown) => {
        return transformDeep(value, {
          funcMap: {
            ilike: (val: unknown, par: unknown) => {
              if (!isObject(par)) return par;
              const p = par as Record<string, unknown>;
              p["$options"] = "i";
              return val;
            },
          },
          keyMap: FilterPipe.replaceOperatorsMap,
        });
      },
    });
  }

  transform(inValue: { filter?: string; fields?: string } | string):
    | {
        filter?: string;
        fields?: string;
      }
    | string {
    if (!inValue || (typeof inValue === "object" && !inValue.filter))
      return inValue;
    const parsedFilter =
      typeof inValue === "string"
        ? JSON.parse(inValue)
        : JSON.parse(inValue.filter!);

    const transformedFilter = this.replaceOperatorsPipe.transform(parsedFilter);

    if (typeof inValue === "string") return JSON.stringify(transformedFilter);
    const result = { ...inValue };
    result.filter = JSON.stringify(transformedFilter);

    return result;
  }
}
