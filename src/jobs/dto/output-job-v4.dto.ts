import { PartialType } from "@nestjs/swagger";
import { CreateJobDto } from "./create-job.dto";
import {
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
} from "class-validator";
import { PartialOutputDatasetDto } from "src/datasets/dto/output-dataset.dto";

export class OutputJobDto extends CreateJobDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  statusCode?: string;

  @IsOptional()
  @IsString()
  statusMessage?: string;

  @IsOptional()
  @IsString()
  configVersion: string;

  @IsOptional()
  @IsObject()
  jobResultObject: Record<string, unknown>;

  @IsString()
  createdBy: string;

  @IsString()
  updatedBy: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

export class PartialOutputJobDto extends PartialType(OutputJobDto) {
  @IsOptional()
  @IsArray()
  datasets: PartialOutputDatasetDto[];

  @IsOptional()
  @IsArray()
  datasetDetails: PartialOutputDatasetDto[];
}

export class PartialIntermediateOutputJobDto extends PartialOutputJobDto {
  @IsString()
  _id: string;

  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  ownerUser: string;

  @IsString()
  ownerGroup: string;
}

export class PartialOutputWithJobIdDto extends PartialOutputJobDto {
  @IsString()
  _id: string;
}
