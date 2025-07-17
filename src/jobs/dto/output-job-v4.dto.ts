import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateJobDto } from "./create-job.dto";
import {
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
} from "class-validator";
import { PartialOutputDatasetDto } from "src/datasets/dto/output-dataset.dto";
import { Instrument } from "src/instruments/schemas/instrument.schema";
import { ProposalClass } from "src/proposals/schemas/proposal.schema";
import { OrigDatablock } from "src/origdatablocks/schemas/origdatablock.schema";
import { Datablock } from "src/datablocks/schemas/datablock.schema";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { SampleClass } from "src/samples/schemas/sample.schema";

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

export class PartialOutputJobDto extends PartialType(OutputJobDto) {
  @ApiProperty({ required: false })
  @IsArray()
  datasets: PartialOutputDatasetDto[];

  @ApiProperty({ required: false })
  @IsArray()
  instruments: Instrument[];

  @ApiProperty({ required: false })
  @IsArray()
  proposals: ProposalClass[];

  @ApiProperty({ required: false })
  @IsArray()
  origdatablocks: OrigDatablock[];

  @ApiProperty({ required: false })
  @IsArray()
  datablocks: Datablock[];

  @ApiProperty({ required: false })
  @IsArray()
  attachments: Attachment[];

  @ApiProperty({ required: false })
  @IsArray()
  samples: SampleClass[];
}

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
