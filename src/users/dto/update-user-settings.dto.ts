import { ApiProperty, PartialType } from "@nestjs/swagger";

export class UpdateUserSettingsDto {
  @ApiProperty()
  readonly columns: Record<string, unknown>[];

  @ApiProperty({ type: Number, required: false, default: 25 })
  readonly datasetCount?: number;

  @ApiProperty({ type: Number, required: false, default: 25 })
  readonly jobCount?: number;
}

export class PartialUpdateUserSettingsDto extends PartialType(
  UpdateUserSettingsDto,
) {}
