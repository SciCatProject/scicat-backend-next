import { ApiProperty } from "@nestjs/swagger";
import { UpdateUserSettingsDto } from "./update-user-settings.dto";
import { IsString } from "class-validator";

export class CreateUserSettingsDto extends UpdateUserSettingsDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  readonly userId: string;
}
