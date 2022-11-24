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
import { DataFile } from "../../common/schemas/datafile.schema";

export class CreateOrigDatablockDto extends OwnableDto {
  @IsString()
  readonly datasetId: string;

  @IsInt()
  readonly size: number;

  @IsOptional()
  @IsString()
  readonly chkAlg: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DataFileDto)
  readonly dataFileList: DataFile[];
}
