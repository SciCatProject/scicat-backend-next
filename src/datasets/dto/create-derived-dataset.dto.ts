import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";
import { CreateDatasetDto } from "./create-dataset.dto";

export class CreateDerivedDatasetDto extends CreateDatasetDto {
  @IsString()
  readonly investigator: string;

  @IsString({
    each: true,
  })
  readonly inputDatasets: string[];

  @IsString({
    each: true,
  })
  readonly usedSoftware: string[];

  @IsOptional()
  @IsObject()
  readonly jobParameters: Record<string, unknown>;

  @IsOptional()
  @IsString()
  readonly jobLogData: string;

  @IsOptional()
  @IsObject()
  readonly scientificMetadata: Record<string, unknown>;
}
