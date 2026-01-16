import { ApiProperty, PartialType } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsOptional, IsString } from "class-validator";

export class OutputMetadataKeyDto {
  @ApiProperty({
    type: String,
    required: true,
    description: "Unique identifier of this metadata key.",
  })
  @IsString()
  declare id: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Metadata key.",
  })
  @IsString()
  key: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Human readable name associated with this metadata key.",
  })
  @IsOptional()
  @IsString()
  humanReadableName?: string;

  @ApiProperty({
    type: [String],
    required: true,
    description: "List of user groups that can access this key.",
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({
    each: true,
  })
  userGroups: string[];

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Type of item this key has been extracted from. Allowed values: Datasets, Proposals, Samples, Instruments.",
  })
  @IsString()
  sourceType: string;
}

export class PartialOutputMetadataKeyDto extends PartialType(
  OutputMetadataKeyDto,
) {}
