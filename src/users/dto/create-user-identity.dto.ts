import { ApiProperty } from "@nestjs/swagger";
import { UpdateUserIdentityDto } from "./update-user-identity.dto";

export class CreateUserIdentityDto extends UpdateUserIdentityDto {
  @ApiProperty()
  readonly authStrategy?: string;

  @ApiProperty()
  readonly userId: string;
}
