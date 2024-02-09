import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { IDatasetList } from "../interfaces/dataset-list.interface";
import { DatasetListDto } from "./dataset-list.dto";
import { UpdateJobDto } from "./update-job.dto";

export class CreateJobDto extends UpdateJobDto {
  @IsEmail()
  readonly emailJobInitiator: string;

  @IsString()
  readonly type: string;

  @IsObject()
  @IsOptional()
  readonly jobParams?: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DatasetListDto)
  readonly datasetList: IDatasetList[];
}
