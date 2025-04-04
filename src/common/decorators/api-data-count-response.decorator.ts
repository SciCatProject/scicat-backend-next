import { applyDecorators, Type } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common/enums";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { DataCountOutputDto } from "../types";

export const ApiDataCountResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  description = "List of items with total count. The list is limited by the limit and offset parameters.",
  statusCode = HttpStatus.OK,
) =>
  applyDecorators(
    ApiExtraModels(DataCountOutputDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(DataCountOutputDto) },
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(dataDto) },
              },
              totalCount: {
                type: "number",
                default: 0,
              },
            },
          },
        ],
        required: ["data", "totalCount"],
      },
      status: statusCode,
      description: description,
    }),
  );
