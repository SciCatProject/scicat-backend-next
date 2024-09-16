import { ApiProperty, PartialType } from "@nestjs/swagger";
import { ScientificCondition } from "../schemas/user-settings.schema";
import { IsArray, IsNumber } from "class-validator";

export class UpdateUserSettingsDto {
  @ApiProperty()
  @IsArray()
  readonly columns: Record<string, unknown>[];

  @ApiProperty({ type: Number, required: false, default: 25 })
  @IsNumber()
  readonly datasetCount?: number;

  @ApiProperty({ type: Number, required: false, default: 25 })
  @IsNumber()
  readonly jobCount?: number;

  @ApiProperty()
  @IsArray()
  readonly filters: Record<string, unknown>[];

  @ApiProperty()
  @IsArray()
  readonly conditions: ScientificCondition[];
}

export class PartialUpdateUserSettingsDto extends PartialType(
  UpdateUserSettingsDto,
) {}
