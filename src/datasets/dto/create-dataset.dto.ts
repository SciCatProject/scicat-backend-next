import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UpdateDatasetDto } from "./update-dataset.dto";
import { Prop } from "@nestjs/mongoose";

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
    description:
      "Characterize type of dataset, either 'raw' or 'derived'. Autofilled when choosing the proper inherited models.",
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "A name for the dataset, given by the creator to carry some semantic meaning. Useful for display purposes e.g. instead of displaying the pid.",
  })
  @IsString()
  declare datasetName: string;
}
