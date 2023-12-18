import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UpdateOrigDatablockDto } from "./update-origdatablock.dto";

export class CreateOrigDatablockDto extends UpdateOrigDatablockDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Persistent identifier of the dataset this orig datablock belongs to.",
  })
  @IsString()
  readonly datasetId: string;
}
