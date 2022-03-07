import { ApiProperty } from "@nestjs/swagger";

export class CreateInstrumentDto {
  @ApiProperty({ type: String, required: true })
  readonly name: string;

  @ApiProperty({ type: Object, required: false, default: {} })
  readonly customMetadata?: Record<string, unknown>;
}
