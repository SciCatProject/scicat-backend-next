import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class DataFileDto {
  @IsString()
  readonly path: string;

  @IsNumber()
  @IsOptional()
  readonly size: number;

  @IsDateString()
  @IsOptional()
  readonly time: Date;

  @IsString()
  @IsOptional()
  readonly chk: string;

  @IsString()
  @IsOptional()
  readonly uid: string;

  @IsString()
  @IsOptional()
  readonly gid: string;

  @IsString()
  @IsOptional()
  readonly perm: string;
}
