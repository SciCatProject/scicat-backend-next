import { get, trim } from "lodash";

type MappingFn<S> = (source: S, key: string) => unknown;
type FieldsMap<S, T = S> = Partial<
  Record<keyof T & string, string | MappingFn<S>>
>;

function getDeep<S, T>(
  source: S,
  key: keyof T & string,
  fieldsMap: FieldsMap<S, T>,
): S[keyof S] | unknown | null {
  if (!source) return null;
  const instruction = fieldsMap[key];
  if (!instruction) return get(source, key);
  if (typeof instruction === "function") return instruction(source, key);
  if (get(source, key)) return get(source, key);
  if (!instruction.includes("[]")) return get(source, instruction);
  const keysList = instruction.split("[]");
  const initialValue = get(source, trim(keysList[0], "."));
  if (!initialValue) return;
  return keysList.slice(1).reduce((acc, currKey) => {
    if (!acc) return acc;
    return acc.map((item: object) => get(item, trim(currKey, ".")));
  }, initialValue);
}

export function createDeepGetter<S, T>(fieldsMap: FieldsMap<S, T>) {
  return (source: S, key: string) => {
    return getDeep<S, T>(source, key as keyof T & string, fieldsMap);
  };
}

export function createDeepGetterAll<S, T>(fieldsMap: FieldsMap<S, T>) {
  const mapper = createDeepGetter(fieldsMap);
  return (source: S): T => {
    if (!source) return source as unknown as T;

    const result: Record<string, unknown> = {};
    Object.keys(fieldsMap).forEach(
      (key) => (result[key] = mapper(source, key)),
    );
    return result as T;
  };
}
