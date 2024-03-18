import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UpdateInstrumentDto } from "./update-instrument.dto";

@ApiTags("instruments")
export class CreateInstrumentDto extends UpdateInstrumentDto {
  @ApiProperty({
    type: String,
    uniqueItems: true,
    required: true,
  })
  @IsString()
  readonly uniqueName: string;
}
