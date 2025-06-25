import { ApiProperty, getSchemaPath, PartialType } from "@nestjs/swagger";
import { CreateDatasetDto } from "./create-dataset.dto";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { ExternalLinkClass } from "../schemas/externallink.class";

export class OutputDatasetDto extends CreateDatasetDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Indicate the user who created this record. This property is added and maintained by the system.",
  })
  @IsString()
  createdBy: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Indicate the user who updated this record last. This property is added and maintained by the system.",
  })
  @IsString()
  updatedBy: string;

  @ApiProperty({
    type: Date,
    required: true,
    description:
      "Date and time when this record was created. This field is managed by mongoose with through the timestamp settings. The field should be a string containing a date in ISO 8601 format (2024-02-27T12:26:57.313Z)",
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    required: true,
    description:
      "Date and time when this record was updated last. This field is managed by mongoose with through the timestamp settings. The field should be a string containing a date in ISO 8601 format (2024-02-27T12:26:57.313Z)",
  })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(ExternalLinkClass) },
    required: false,
    default: [],
    description: "List of external links that involve this data set.",
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExternalLinkClass)
  readonly externalLinks?: ExternalLinkClass[];

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Version of the API used when the dataset was created or last updated. API version is defined in code for each release. Managed by the system.",
  })
  @IsString()
  version: string;
}

export class PartialOutputDatasetDto extends PartialType(OutputDatasetDto) {}
