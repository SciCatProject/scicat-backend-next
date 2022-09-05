import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsObject, IsOptional, IsString } from "class-validator";
import { CreateDatasetDto } from "./create-dataset.dto";

export class CreateRawDatasetDto extends CreateDatasetDto {
  @ApiProperty()
  @IsString()
  readonly principalInvestigator: string;

  @ApiProperty({ type: Date })
  @IsOptional()
  @IsDateString()
  readonly endTime: Date;

  @ApiProperty()
  @IsString()
  readonly creationLocation: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly dataFormat: string;

  @ApiProperty({ type: Object })
  @IsOptional()
  @IsObject()
  readonly scientificMetadata: Record<string, unknown>;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly proposalId: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly sampleId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly instrumentId: string;
}
