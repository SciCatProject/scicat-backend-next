import { IsDateString } from "class-validator";
import { CreateAttachmentObsoleteDto } from "./create-attachment-obsolete.dto";
import { ApiProperty } from "@nestjs/swagger";

export class OutputAttachmentObsoleteDto extends CreateAttachmentObsoleteDto {
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
