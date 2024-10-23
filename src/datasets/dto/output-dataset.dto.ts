import { ApiProperty } from "@nestjs/swagger";
import { CreateDatasetDto } from "./create-dataset.dto";
import { IsDateString, IsString } from "class-validator";

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
}
