export type searchType =
  | "text"
  | "keyword"
  | "long"
  | "integer"
  | "date"
  | "boolean"
  | "object"
  | "nested";

export interface MappingProperty {
  type: searchType;
  fields?: {
    keyword: {
      type: searchType;
      ignore_above: number;
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface MappingObject {
  [key: string]: MappingProperty;
}
