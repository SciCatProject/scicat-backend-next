import {IsArray, IsNotEmpty, IsString} from "class-validator";

export class DatasetListDto {
  @IsString()
  @IsNotEmpty()
  readonly pid: string;

  @IsArray()
  @IsString({each: true})
  readonly files: string[];
}
