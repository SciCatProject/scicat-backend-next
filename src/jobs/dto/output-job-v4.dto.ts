import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateJobDto } from "./create-job.dto";
import { IsDateString, IsObject, IsOptional, IsString } from "class-validator";

export class OutputJobDto extends CreateJobDto {
  @ApiProperty({
    description: "Globally unique identifier of a job.",
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: "Current status code of the job.",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  statusCode?: string;

  @ApiProperty({
    description: "Latest status message received for this job.",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  statusMessage?: string;

  @ApiProperty({
    description: "Configuration version that was used to create this job.",
    type: String,
  })
  @IsString()
  configVersion: string;

  @ApiProperty({
    description: "Contains the dataset archiving results.",
    type: Object,
  })
  @IsObject()
  jobResultObject: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: true,
    description: "User who created this job. System managed.",
  })
  @IsString()
  createdBy: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "User who last updated this job. System managed.",
  })
  @IsString()
  updatedBy: string;

  @ApiProperty({
    type: Date,
    required: true,
    description: "Date/time when the job was created. ISO 8601 format.",
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    required: true,
    description: "Date/time when the job was last updated. ISO 8601 format.",
  })
  @IsDateString()
  updatedAt: Date;
}

export class PartialOutputJobDto extends PartialType(OutputJobDto) {}

export class PartialIntermediateOutputJobDto extends PartialOutputJobDto {
  @ApiProperty({ required: true })
  @IsString()
  _id: string;

  @ApiProperty({ required: true })
  @IsString()
  id: string;

  @ApiProperty({ required: true })
  @IsString()
  type: string;

  @ApiProperty({ required: true })
  @IsString()
  ownerUser: string;

  @ApiProperty({ required: true })
  @IsString()
  ownerGroup: string;
}

export class PartialOutputWithJobIdDto extends PartialOutputJobDto {
  @ApiProperty({ required: true })
  @IsString()
  _id: string;
}
