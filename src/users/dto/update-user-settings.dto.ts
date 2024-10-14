import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, IsObject, IsOptional } from "class-validator";

export class UpdateUserSettingsDto {
  @ApiProperty({ type: Number, required: false, default: 25 })
  @IsNumber()
  readonly datasetCount?: number;

  @ApiProperty({ type: Number, required: false, default: 25 })
  @IsNumber()
  readonly jobCount?: number;

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
  })
  @IsOptional()
  @IsObject()
  readonly externalSettings?: Record<string, unknown>;
}

export class PartialUpdateUserSettingsDto extends PartialType(
  UpdateUserSettingsDto,
) {}
