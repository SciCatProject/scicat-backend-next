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
import { ApiProperty } from "@nestjs/swagger";

export class CreateJobDto {
  @ApiProperty({
    type: String,
    required: true,
    description: "Valid job type as defined in configuration.",
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    type: Object,
    required: true,
    description: "Job's parameters as defined by job template in configuration",
  })
  @IsObject()
  readonly jobParams: Record<string, unknown>;

}
