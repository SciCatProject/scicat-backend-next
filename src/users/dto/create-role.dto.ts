import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly created: Date;

  @ApiProperty()
  readonly modified: Date;
}
