import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { DataFileDto } from "src/common/dto/datafile.dto";
import { DataFile } from "src/common/schemas/datafile.schema";

export class DatasetListDto {
  @IsString()
  @IsNotEmpty()
  readonly pid: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataFileDto)
  readonly files: DataFile[];
}
