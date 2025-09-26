import {
  ContentObject,
  SchemaObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { boolean } from "mathjs";

const WHERE = {
  type: "object",
  example: {
    _id: "123",
  },
};

const FIELDS = {
  type: "array",
  items: {
    type: "string",
    example: "createdAt",
  },
};

const SORT = {
  sort: {
    type: "object",
    properties: {
      createdAt: {
        type: "string",
        example: "asc | desc",
      },
    },
  },
};

const LIMITS = (sort: object = SORT) => {
  return {
    type: "object",
    properties: {
      limit: {
        type: "number",
        example: 10,
      },
      skip: {
        type: "number",
        example: 0,
      },
      ...sort,
    },
  };
};

const RELATION = (limits: object = LIMITS()) => {
  return {
    type: "object",
    properties: {
      relation: {
        type: "string",
        example: "datablock",
      },
      scope: {
        type: "object",
        properties: {
          where: WHERE,
          fields: FIELDS,
          limits: limits,
        },
      },
    },
  };
};

const INCLUDE = (relation: object = RELATION()) => {
  return {
    oneOf: [
      {
        type: "string",
        example: "attachments",
      },
      relation,
    ],
  };
};

const filtersV3Builder = () => {
  const sort = {
    order: {
      type: "array",
      items: { type: "string", example: "createdAt:asc" },
    },
  };
  const limits = LIMITS(sort);
  const relation = RELATION(limits);
  const include = INCLUDE(relation);
  return {
    where: WHERE,
    include: {
      type: "array",
      items: include,
    },
    fields: FIELDS,
    limits: limits,
  };
};

const FILTERSV3 = filtersV3Builder();

const FILTERS: Record<"limits" | "fields" | "where" | "include", object> = {
  where: WHERE,
  include: {
    type: "array",
    items: INCLUDE(),
  },
  fields: FIELDS,
  limits: LIMITS(),
};

/**
 * NOTE: This is disabled only for the official sdk package generation as the schema validation complains about the content field.
 * But we want to have it when we run the application as it improves swagger documentation and usage a lot.
 * We use "content" property as it is described in the swagger specification: https://swagger.io/docs/specification/v3_0/describing-parameters/#schema-vs-content:~:text=explode%3A%20false-,content,-is%20used%20in
 */
export const getSwaggerDatasetFilterContent = (
  filtersToInclude: Record<keyof typeof FILTERS, boolean> = {
    where: true,
    include: true,
    fields: true,
    limits: true,
  },
  version = "v4",
): ContentObject | undefined => {
  if (boolean(process.env.SDK_PACKAGE_SWAGGER_HELPERS_DISABLED ?? false)) {
    return undefined;
  }
  const filtersVersion = version === "v4" ? FILTERS : FILTERSV3;

  const filterContent: Record<string, { schema: SchemaObject }> = {
    "application/json": {
      schema: {
        type: "object",
        properties: {},
      },
    },
  };

  for (const filtersKey in filtersToInclude) {
    const key = filtersKey as keyof typeof filtersVersion;

    if (filtersToInclude[key] && filtersVersion[key]) {
      filterContent["application/json"].schema.properties![key] =
        filtersVersion[key];
    }
  }

  return filterContent;
};
