import { ApiProperty } from '@nestjs/swagger';

export class CredentialsDto {
  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly password: string;
}
