import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DatasetType } from "../dataset-type.enum";
import { UpdateDatasetDto } from "./update-dataset.dto";

export class CreateDatasetDto extends UpdateDatasetDto {
  @ApiProperty({
    type: String,
    required: false,
    description: "Persistent identifier of the dataset.",
  })
  @IsOptional()
  @IsString()
  pid?: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: [DatasetType.Raw, DatasetType.Derived],
    description:
      "Characterize type of dataset, either 'raw' or 'derived'. Autofilled when choosing the proper inherited models.",
  })
  @IsEnum(DatasetType)
  readonly type: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Version of the API used in creation of the dataset.",
  })
  @IsOptional()
  @IsString()
  readonly version?: string;
}
