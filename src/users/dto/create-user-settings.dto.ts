import { ApiProperty } from "@nestjs/swagger";

export class CreateUserSettingsDto {
  @ApiProperty({ type: String, required: true })
  readonly name: string;

  @ApiProperty()
  readonly columns: Record<string, unknown>[];

  @ApiProperty({ type: Number, required: false, default: 25 })
  readonly datasetCount?: number;

  @ApiProperty({ type: Number, required: false, default: 25 })
  readonly jobCount?: number;
}
