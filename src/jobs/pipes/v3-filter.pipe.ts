import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { jobV3toV4FieldMap } from "../types/jobs-filter-content";
import _ from "lodash";

type KeyMap = Record<string, string>;

type Func = (value: unknown) => unknown;

type FuncMap = Record<string, (value: unknown, parent: unknown) => unknown>;

interface TransformDeepOptions {
  keyMap?: KeyMap;
  funcMap?: FuncMap;
  arrayFn?: Func;
  valueFn?: Func;
}

export const transformDeep = (
  obj: unknown,
  opts: TransformDeepOptions = {},
): unknown => {
  const { keyMap = {}, funcMap = {}, arrayFn, valueFn } = opts;

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      arrayFn ? arrayFn(transformDeep(item, opts)) : transformDeep(item, opts),
    );
  }

  if (obj && typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const mappedKey = keyMap[key] ?? key;
      let transformed: unknown;
      if (funcMap[key]) {
        transformed = funcMap[key](value, newObj);
      } else {
        transformed = transformDeep(value, opts);
      }
      newObj[mappedKey] = valueFn ? valueFn(transformed) : transformed;
    }
    return newObj;
  }

  return obj;
};

class ParseJsonPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}

class ParseDeepJsonPipe implements PipeTransform<string, string | object> {
  private jsonPipe = new ParseJsonPipe();

  transform(value: string): string | object {
    const parsed = this.jsonPipe.transform(value);
    return transformDeep(parsed, {
      valueFn: (value) => this.jsonPipe.transform(value as string),
    }) as object;
  }
}

export class ReplaceObjKeysPipe implements PipeTransform<unknown, unknown> {
  constructor(private keyMap: KeyMap) {}

  transform(value: unknown): unknown {
    return transformDeep(value, { keyMap: this.keyMap });
  }
}

export class TransformObjValuesPipe implements PipeTransform<unknown, unknown> {
  constructor(private funcMap: FuncMap) {}

  transform(value: unknown): unknown {
    return transformDeep(value, { funcMap: this.funcMap });
  }
}

class TransformArrayValuesPipe implements PipeTransform<unknown, unknown> {
  constructor(private arrayFn: (item: unknown) => unknown) {}

  transform(value: unknown): unknown {
    return transformDeep(value, { arrayFn: this.arrayFn });
  }
}

class ComposePipe<T = unknown> implements PipeTransform<T, T> {
  private readonly pipes: PipeTransform[];
  private readonly jsonToString = new JsonToStringPipe();
  private readonly parseDeepJson = new ParseDeepJsonPipe();

  constructor(
    pipes: PipeTransform[],
    private readonly jsonTransform = true,
  ) {
    this.pipes = [...pipes];
    if (this.jsonTransform) {
      this.pipes.unshift(this.parseDeepJson);
      this.pipes.push(this.jsonToString);
    }
  }

  transform(value: T, metadata: ArgumentMetadata = {} as ArgumentMetadata): T {
    return this.pipes.reduce(
      (val, pipe) => pipe.transform(val, metadata),
      value,
    );
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

@Injectable()
export class V3ConditionToV4Pipe extends ComposePipe<object> {
  // it replaces object keys following the keyMappings object
  // for example, it replaces keys from the v3 DTO (user-facing)
  // to database fields later used in the aggregation pipeline
  // for example from {where: {user-facing-1: 'abc'} to {where: {db-field1: 'abc'}

  constructor(keyMappings = jobV3toV4FieldMap, jsonTransform = true) {
    super([new ReplaceObjKeysPipe(keyMappings)], jsonTransform);
  }
}

@Injectable()
export class V3LimitsToV4Pipe extends ComposePipe<object> {
  // it replaces list elements following the <keyMappings object>:asc|desc
  // for example, it replaces {order: ['user-facing1:asc', 'user-facing2:asc']}
  // with {order: ['db-field1:asc', 'db-field2:asc']}

  constructor(keyMappings = jobV3toV4FieldMap, jsonTransform = true) {
    const sortToOrderPipe = new TransformObjValuesPipe({
      order: (value: unknown) => {
        const isArray = _.isArray(value);
        const order = (isArray ? value : [value]).reduce((acc, orderValue) => {
          const [field, direction] = (orderValue as string).split(":");
          return acc.concat(`${keyMappings[field]}:${direction ?? "asc"}`);
        }, [] as string[]);
        return isArray ? order : order[0];
      },
    });
    super([sortToOrderPipe], jsonTransform);
  }
}

@Injectable()
export class V3FieldsToV4Pipe extends ComposePipe<object> {
  // it replaces list elements following the keyMappings object
  // for example, it replaces the fields: [user-facing1, user-facing2]
  // with [db-field1, db-field2]

  constructor(keyMappings = jobV3toV4FieldMap, jsonTransform = true) {
    super(
      [
        new TransformArrayValuesPipe((item) => {
          if (_.isString(item) && keyMappings[item]) return keyMappings[item];
          return item;
        }),
      ],
      jsonTransform,
    );
  }
}

@Injectable()
export class V3FilterToV4Pipe extends ComposePipe<string> {
  // it combines the 3 pipes together
  // for example
  // from {where: {user-facing1: 'abc'}, limits: {order: ['user-facing1:asc']}, fields: ['user-facing1']}
  // to {where: {db-field1: 'abc'}, limits: {order: ['db-field1:asc']}, fields: ['db-field1']}

  constructor(keyMappings = jobV3toV4FieldMap, jsonTransform = true) {
    super(
      [
        new V3LimitsToV4Pipe(keyMappings, false),
        new V3ConditionToV4Pipe(keyMappings, false),
        new V3FieldsToV4Pipe(keyMappings, false),
      ],
      jsonTransform,
    );
  }
}
