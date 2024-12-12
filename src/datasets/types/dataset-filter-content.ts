import { ContentObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const getSwaggerDatasetFilterContent = (): ContentObject | undefined => {
  /**
   * NOTE: This is disabled only for the official sdk package generation as the schema validation complains about the content.
   * But we want to have it when we run the application as it improves swagger documentation and usage a lot.
   */
  console.log(process.env.SDK_PACKAGE_SWAGGER_HELPERS_DISABLED);
  return process.env.SDK_PACKAGE_SWAGGER_HELPERS_DISABLED
    ? undefined
    : {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              where: {
                type: "object",
              },
              include: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              fields: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              limits: {
                type: "object",
                properties: {
                  limit: {
                    type: "number",
                  },
                  skip: {
                    type: "number",
                  },
                  order: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        field: {
                          type: "string",
                        },
                        direction: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
};
