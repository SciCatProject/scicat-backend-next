import { ApiProperty } from "@nestjs/swagger";

export class CreateRoleDto {
  @ApiProperty()
  readonly name: string;
}
