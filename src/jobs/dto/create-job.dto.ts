import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { IDatasetList } from "../interfaces/dataset-list.interface";
import { DatasetListDto } from "./dataset-list.dto";

export class CreateJobDto {
  @IsEmail()
  readonly emailJobInitiator: string;

  @IsString()
  readonly type: string;

  @IsDateString()
  @IsOptional()
  readonly creationTime?: Date;

  @IsDateString()
  @IsOptional()
  readonly executionTime?: Date;

  @IsObject()
  @IsOptional()
  readonly jobParams?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  readonly jobStatusMessage?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DatasetListDto)
  readonly datasetList: IDatasetList[];

  @IsObject()
  @IsOptional()
  readonly jobResultObject?: Record<string, unknown>;
}
