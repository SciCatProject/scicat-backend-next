import { PipeTransform } from "@nestjs/common";
import { jobV3toV4FieldMap } from "../types/jobs-filter-content";
import {
  FieldsPipe,
  FilterPipe,
  FilterPipeAbstract,
  OrderPipe,
  WherePipe,
} from "src/common/pipes/filter.pipe";
import { JobClass } from "../schemas/job.schema";

class ParseDeepJsonPipe extends FilterPipeAbstract<JobClass> {
  private parseJson(value: string): string {
    if (!value || typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  applyTransform(value: string): string | object {
    const parsed = this.parseJson(value);
    return FilterPipeAbstract.transformDeep(parsed, {
      valueFn: (val) => this.parseJson(val as string),
    }) as object;
  }
}

class JsonToStringPipe implements PipeTransform<object, string | object> {
  transform(value: object): string | object {
    try {
      return JSON.stringify(value);
    } catch {
      return value;
    }
  }
}

export const V3_WHERE_TO_V4_PIPE = [
  new ParseDeepJsonPipe(),
  new WherePipe<JobClass>({ apiToDBMap: jobV3toV4FieldMap }),
  new JsonToStringPipe(),
];
export const V3_ORDER_TO_V4_PIPE = [
  new ParseDeepJsonPipe(),
  new OrderPipe<JobClass>({ apiToDBMap: jobV3toV4FieldMap }),
  new JsonToStringPipe(),
];
export const V3_FIELDS_TO_V4_PIPE = [
  new ParseDeepJsonPipe(),
  new FieldsPipe<JobClass>({ apiToDBMap: jobV3toV4FieldMap }),
  new JsonToStringPipe(),
];
export const V3_FILTER_TO_V4_PIPE = [
  new ParseDeepJsonPipe(),
  new FilterPipe<JobClass>({ apiToDBMap: jobV3toV4FieldMap }),
  new JsonToStringPipe(),
];
