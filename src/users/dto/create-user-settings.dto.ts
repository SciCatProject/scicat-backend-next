import { ApiProperty } from "@nestjs/swagger";
import { UpdateUserSettingsDto } from "./update-user-settings.dto";

export class CreateUserSettingsDto extends UpdateUserSettingsDto {
  @ApiProperty({ type: String, required: true })
  readonly userId: string;
}
