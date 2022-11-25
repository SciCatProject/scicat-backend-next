import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class DatasetListDto {
  @IsString()
  @IsNotEmpty()
  readonly pid: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  readonly files: string[];
}
