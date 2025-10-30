import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { jobV3toV4FieldMap } from "../types/jobs-filter-content";
import _ from "lodash";

interface TransformDeepOptions {
  keyMap?: KeyMap;
  funcMap?: FuncMap;
  arrayFn?: (item: unknown) => unknown;
  valueFn?: (
    value: unknown,
    key?: string,
    obj?: Record<string, unknown>,
  ) => unknown;
}

const transformDeep = (
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
        transformed = funcMap[key](value, obj as Record<string, unknown>);
      } else {
        transformed = transformDeep(value, opts);
      }
      newObj[mappedKey] = valueFn
        ? valueFn(transformed, mappedKey, obj as Record<string, unknown>)
        : transformed;
    }
    return newObj;
  }

  return obj;
};

type KeyMap = Record<string, string>;

type FuncMap = Record<
  string,
  (value: unknown, obj?: Record<string, unknown>) => unknown
>;

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

class ParseDeepJsonPipe implements PipeTransform<string, unknown> {
  private jsonPipe = new ParseJsonPipe();

  transform(value: string): unknown {
    const parsed = this.jsonPipe.transform(value);
    return transformDeep(parsed, {
      valueFn: (value, _key, _obj) => this.jsonPipe.transform(value as string),
    });
  }
}

class ReplaceObjKeysPipe implements PipeTransform<unknown, unknown> {
  constructor(private keyMap: KeyMap) {}

  transform(value: unknown): unknown {
    return transformDeep(value, { keyMap: this.keyMap });
  }
}

class TransformObjValuesPipe implements PipeTransform<unknown, unknown> {
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
export class V3LimitsToV4Pipe extends ComposePipe<object> {
  constructor(keyMappings = jobV3toV4FieldMap, jsonTransform = true) {
    const sortToOrderPipe = new TransformObjValuesPipe({
      order: (value: unknown) => {
        const isArray = _.isArray(value);
        const order = (isArray ? value : [value]).reduce((acc, orderValue) => {
          const [field, direction] = (orderValue as string).split(":");
          return acc.concat(`${keyMappings[field]}:${direction}`);
        }, [] as string[]);
        return isArray ? order : order[0];
      },
    });
    super(
      [sortToOrderPipe, new V3ConditionToV4Pipe(keyMappings, false)],
      jsonTransform,
    );
  }
}

@Injectable()
export class V3ConditionToV4Pipe extends ComposePipe<object> {
  constructor(keyMappings = jobV3toV4FieldMap, jsonTransform = true) {
    super([new ReplaceObjKeysPipe(keyMappings)], jsonTransform);
  }
}

@Injectable()
export class V3FieldsToV4Pipe extends ComposePipe<object> {
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
