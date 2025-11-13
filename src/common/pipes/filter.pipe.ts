import { Injectable, PipeTransform } from "@nestjs/common";
import {
  transformDeep,
  TransformObjValuesPipe,
} from "src/jobs/pipes/v3-filter.pipe";
import { IFilters } from "../interfaces/common.interface";

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
export class FilterPipe<T = unknown>
  implements
    PipeTransform<
      { filter?: string } | string,
      { filter?: IFilters<T> } | IFilters<T>
    >
{
  private static readonly replaceOperatorsMap = {
    inq: "$in",
    nin: "$nin",
    and: "$and",
    or: "$or",
    like: "$regex",
    ilike: "$regex",
    gte: "$gte",
    lte: "$lte",
    gt: "$gt",
    lt: "$lt",
  };
  private readonly replaceOperatorsPipe: TransformObjValuesPipe;

  constructor() {
    this.replaceOperatorsPipe = new TransformObjValuesPipe({
      where: (value: unknown) => {
        return transformDeep(value, {
          funcMap: {
            ilike: (val: unknown, par: unknown) => {
              const p = par as Record<string, unknown>;
              p["$options"] = "i";
              return val;
            },
          },
          valueFn: (val: unknown) => {
            if (typeof val !== "string") return val;
            const dateFromString = new Date(val);
            return isNaN(dateFromString.getTime()) ? val : dateFromString;
          },
          keyMap: FilterPipe.replaceOperatorsMap,
        });
      },
    });
  }

  transform(inValue: { filter?: string } | string):
    | {
        filter?: IFilters<T>;
      }
    | IFilters<T> {
    if (!inValue || (typeof inValue === "object" && !inValue.filter))
      return inValue as { filter?: IFilters<T> } | IFilters<T>;
    const parsedFilter =
      typeof inValue === "string"
        ? JSON.parse(inValue)
        : JSON.parse(inValue.filter!);

    const transformedFilter = this.replaceOperatorsPipe.transform(
      parsedFilter,
    ) as IFilters<T>;

    if (typeof inValue === "string") return transformedFilter;
    return { ...inValue, filter: transformedFilter };
  }
}
