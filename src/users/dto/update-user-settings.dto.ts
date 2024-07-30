import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
  FilterConfig,
  ScientificCondition,
} from "../schemas/user-settings.schema";

export class UpdateUserSettingsDto {
  @ApiProperty()
  readonly columns: Record<string, unknown>[];

  @ApiProperty({ type: Number, required: false, default: 25 })
  readonly datasetCount?: number;

  @ApiProperty({ type: Number, required: false, default: 25 })
  readonly jobCount?: number;

  @ApiProperty()
  readonly filters: FilterConfig[];

  @ApiProperty()
  readonly conditions: ScientificCondition[];
}

export class PartialUpdateUserSettingsDto extends PartialType(
  UpdateUserSettingsDto,
) {}
