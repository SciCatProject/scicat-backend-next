import { ApiProperty } from "@nestjs/swagger";

export class CreateUserRoleDto {
  @ApiProperty()
  readonly userId: string;

  @ApiProperty()
  readonly roleId: string;
}
