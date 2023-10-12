export type searchType =
  | "text"
  | "keyword"
  | "long"
  | "integer"
  | "date"
  | "boolean"
  | "object"
  | "nested";

export type ObjectType = {
  begin: string;
  end: string;
};

export interface IShould {
  terms?: {
    [key: string]: string[] | undefined;
  };
  term?: {
    [key: string]: string | undefined;
  };
}

export interface IFilter {
  terms?: {
    [key: string]: string[];
  };
  term?: {
    [key: string]: boolean | string;
  };
  range?: {
    [key: string]: {
      gte?: string | number;
      lte?: string | number;
    };
  };
  nested?: {
    path: string;
    query: {
      bool: {
        must: (
          | { match?: { [key: string]: string } }
          | { range?: { [key: string]: { [key: string]: string | number } } }
        )[];
      };
    };
  };
}
