import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UpdateDatablockDto } from "./update-datablock.dto";

export class CreateDatablockDto extends UpdateDatablockDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Persistent identifier of the dataset this orig datablock belongs to.",
  })
  @IsString()
  readonly datasetId: string;
}
