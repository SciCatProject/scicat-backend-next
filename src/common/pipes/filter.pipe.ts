import { Injectable, PipeTransform } from "@nestjs/common";
import { transformDeep } from "src/jobs/pipes/v3-filter.pipe";
import { IFilters } from "../interfaces/common.interface";
import { isPlainObject, keys, pickBy } from "lodash";

abstract class FilterPipeAbstract<T = unknown> implements PipeTransform<
  { filter?: string } | string,
  { filter?: IFilters<T> } | IFilters<T>
> {
  abstract applyTransform(value: unknown): unknown;

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

    const transformedFilter = this.applyTransform(parsedFilter) as IFilters<T>;

    if (typeof inValue === "string") return transformedFilter;
    return { ...inValue, filter: transformedFilter };
  }
}

@Injectable()
export class WherePipe<T = unknown> extends FilterPipeAbstract<T> {
  private readonly replaceOperatorsMap = {
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

  applyTransform(value: unknown): unknown {
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
      keyMap: this.replaceOperatorsMap,
    });
  }
}

@Injectable()
export class FieldsPipe<T = unknown> extends FilterPipeAbstract<T> {
  applyTransform(value: unknown) {
    if (isPlainObject(value)) {
      return keys(pickBy(value as Record<string, boolean>, Boolean));
    }
    return value;
  }
}

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
export class FilterPipe<T = unknown> extends FilterPipeAbstract<T> {
  private wherePipe = new WherePipe();
  private fieldsPipe = new FieldsPipe();
  private options: { allowObjectFields: boolean };

  constructor(options?: { allowObjectFields: boolean }) {
    super();
    this.options = options ?? { allowObjectFields: true };
  }

  applyTransform(value: unknown): unknown {
    const fields: { fields?: (value: unknown) => unknown } = {};
    if (this.options.allowObjectFields)
      fields.fields = (val) => this.fieldsPipe.applyTransform(val);
    return transformDeep(value, {
      funcMap: {
        where: (val) => this.wherePipe.applyTransform(val),
        ...fields,
      },
    });
  }
}
