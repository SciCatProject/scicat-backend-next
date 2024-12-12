import { ContentObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { boolean } from "mathjs";

export const getSwaggerDatasetFilterContent = (): ContentObject | undefined => {
  /**
   * NOTE: This is disabled only for the official sdk package generation as the schema validation complains about the content field.
   * But we want to have it when we run the application as it improves swagger documentation and usage a lot.
   */
  return boolean(process.env.SDK_PACKAGE_SWAGGER_HELPERS_DISABLED ?? false)
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
