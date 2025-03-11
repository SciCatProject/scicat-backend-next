import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { DatasetListDto } from "./dataset-list.dto";
import { UpdateJobDtoV3 } from "./update-job.v3.dto";

export class CreateJobDtoV3 extends UpdateJobDtoV3 {
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
  readonly datasetList: DatasetListDto[];
}
