import { PartialType } from "@nestjs/swagger";
import { CreateUserSettingsDto } from "./create-user-settings.dto";

export class UpdateUserSettingsDto extends PartialType(CreateUserSettingsDto) {}
