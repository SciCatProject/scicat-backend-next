import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
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
    description:
      "Characterize type of dataset, either 'raw' or 'derived'. Autofilled when choosing the proper inherited models.",
  })
  @IsString()
  readonly type: string;
}
