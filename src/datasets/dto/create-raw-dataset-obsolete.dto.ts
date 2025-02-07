import { UpdateRawDatasetObsoleteDto } from "./update-raw-dataset-obsolete.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { DatasetType } from "../types/dataset-type.enum";

export class CreateRawDatasetObsoleteDto extends UpdateRawDatasetObsoleteDto {
  @ApiProperty({
    type: String,
    required: false,
    description: "Persistent identifier of the dataset.",
  })
  @IsOptional()
  @IsString()
  pid?: string;

  @IsEnum(DatasetType)
  readonly type: string = DatasetType.Raw;

  @ApiProperty({
    type: String,
    required: false,
    description: "Version of the API used in creation of the dataset.",
  })
  @IsOptional()
  @IsString()
  readonly version?: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "A name for the dataset, given by the creator to carry some semantic meaning. Useful for display purposes e.g. instead of displaying the pid.",
  })
  @IsString()
  declare readonly datasetName: string;
}
