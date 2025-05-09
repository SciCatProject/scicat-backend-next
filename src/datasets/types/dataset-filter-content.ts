import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

const FILTERS: Record<"limits" | "fields" | "where" | "include", object> = {
  where: { datasetName: { $regex: "Dataset", $options: "i" } },
  include: ["attachments"],
  fields: ["datasetName"],
  limits: {
    limit: 10,
    skip: 0,
    sort: { createdAt: "desc" },
  },
};

export const getSwaggerDatasetFilterContent = (
  filtersToInclude: Record<keyof typeof FILTERS, boolean> = {
    where: true,
    include: true,
    fields: true,
    limits: true,
  },
): SchemaObject => {
  const filterContent: SchemaObject = {
    type: "object",
    example: {},
  };

  for (const filtersKey in filtersToInclude) {
    const key = filtersKey as keyof typeof FILTERS;

    if (filtersToInclude[key] && FILTERS[key]) {
      filterContent.example[key] = FILTERS[key];
    }
  }

  console.log("filterContent", JSON.stringify(filterContent, null, 2));

  return filterContent;
};
