import { getSwaggerDatasetFilterContent } from "./dataset-filter-content";

const FILTERS: Record<"limits" | "fields" | "where" | "include", object> = {
  where: { type: "object", example: { _id: "123" } },
  include: {
    type: "array",
    items: {
      oneOf: [
        { type: "string", example: "attachments" },
        {
          type: "object",
          properties: {
            relation: { type: "string", example: "datablock" },
            scope: {
              type: "object",
              properties: {
                where: { type: "object", example: { _id: "123" } },
                fields: {
                  type: "array",
                  items: { type: "string", example: "createdAt" },
                },
                limits: {
                  type: "object",
                  properties: {
                    limit: { type: "number", example: 10 },
                    skip: { type: "number", example: 0 },
                    order: {
                      type: "array",
                      items: { type: "string", example: "createdAt:asc" },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  },
  fields: { type: "array", items: { type: "string", example: "createdAt" } },
  limits: {
    type: "object",
    properties: {
      limit: { type: "number", example: 10 },
      skip: { type: "number", example: 0 },
      order: {
        type: "array",
        items: { type: "string", example: "createdAt:asc" },
      },
    },
  },
};

export const getSwaggerDatasetFilterContentV3 = () => {
  return getSwaggerDatasetFilterContent(undefined, FILTERS);
};
