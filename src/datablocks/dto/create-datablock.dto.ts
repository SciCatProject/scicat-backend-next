import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { DataFileDto } from "src/common/dto/datafile.dto";
import { OwnableDto } from "src/common/dto/ownable.dto";
import { DataFile } from "src/common/schemas/datafile.schema";

export class CreateDatablockDto extends OwnableDto {
  @IsString()
  readonly datasetId: string;

  @IsString()
  readonly archiveId: string;

  @IsInt()
  readonly size: number;

  @IsInt()
  readonly packedSize: number;

  @IsOptional()
  @IsString()
  readonly chkAlg: string;

  @IsString()
  readonly version: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DataFileDto)
  readonly dataFileList: DataFile[];
}
