import {
  ContentObject,
  SchemaObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

const FILTERS: Record<"limits" | "fields" | "where" | "include", object> = {
  where: {
    "relationships.targetId": "datasetId",
    "relationships.targetType": "dataset",
    "relationships.relationType": "is attached to",
  },
  include: [],
  fields: ["relationships"],
  limits: {
    limit: 10,
    skip: 0,
    sort: { createdAt: "desc" },
  },
};
export const getSwaggerAttachmentFilterContent = (
  filtersToInclude: Record<keyof typeof FILTERS, boolean> = {
    where: true,
    include: false,
    fields: true,
    limits: true,
  },
): ContentObject | undefined => {
  const filterContent: Record<string, { schema: SchemaObject }> = {
    "application/json": {
      schema: {
        type: "object",
        example: {},
      },
    },
  };

  for (const filtersKey in filtersToInclude) {
    const key = filtersKey as keyof typeof FILTERS;

    if (filtersToInclude[key] && FILTERS[key]) {
      filterContent["application/json"].schema.example[key] = FILTERS[key];
    }
  }

  return filterContent;
};
