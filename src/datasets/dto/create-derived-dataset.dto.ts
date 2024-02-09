import { UpdateDerivedDatasetDto } from "./update-derived-dataset.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { DatasetType } from "../dataset-type.enum";

export class CreateDerivedDatasetDto extends UpdateDerivedDatasetDto {
  @ApiProperty({
    type: String,
    required: false,
    description: "Persistent identifier of the dataset.",
  })
  @IsOptional()
  @IsString()
  pid?: string;

  @IsEnum(DatasetType)
  readonly type: string = DatasetType.Derived;

  @ApiProperty({
    type: String,
    required: false,
    description: "Version of the API used in creation of the dataset.",
  })
  @IsOptional()
  @IsString()
  readonly version?: string;
}
