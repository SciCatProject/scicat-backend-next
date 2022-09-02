import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";
import { CreateDatasetDto } from "./create-dataset.dto";

export class CreateDerivedDatasetDto extends CreateDatasetDto {
  @ApiProperty()
  @IsString()
  readonly investigator: string;

  @ApiProperty({ type: [String] })
  @IsString({
    each: true,
  })
  readonly inputDatasets: string[];

  @ApiProperty({ type: [String] })
  @IsString({
    each: true,
  })
  readonly usedSoftware: string[];

  @ApiProperty({ type: Object })
  @IsOptional()
  @IsObject()
  readonly jobParameters: Record<string, unknown>;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly jobLogData: string;

  @ApiProperty({ type: Object })
  @IsOptional()
  @IsObject()
  readonly scientificMetadata: Record<string, unknown>;
}
