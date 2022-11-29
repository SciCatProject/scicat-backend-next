import { IsDateString, IsObject, IsOptional, IsString } from "class-validator";
import { CreateDatasetDto } from "./create-dataset.dto";

export class CreateRawDatasetDto extends CreateDatasetDto {
  @IsString()
  readonly principalInvestigator: string;

  @IsOptional()
  @IsDateString()
  readonly endTime?: Date;

  @IsString()
  readonly creationLocation: string;

  @IsOptional()
  @IsString()
  readonly dataFormat: string;

  @IsOptional()
  @IsObject()
  readonly scientificMetadata: Record<string, unknown>;

  @IsOptional()
  @IsString()
  readonly proposalId: string;

  @IsOptional()
  @IsString()
  readonly sampleId: string;

  @IsOptional()
  @IsString()
  readonly instrumentId: string;
}
