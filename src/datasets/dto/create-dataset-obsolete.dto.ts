import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UpdateDatasetObsoleteDto } from "./update-dataset-obsolete.dto";
import { DatasetType } from "../types/dataset-type.enum";

export class CreateDatasetObsoleteDto extends UpdateDatasetObsoleteDto {
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
