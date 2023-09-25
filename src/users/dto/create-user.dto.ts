import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ required: true })
  readonly username: string;

  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: false })
  readonly password?: string;

  @ApiProperty({ required: false })
  readonly role?: string;

  @ApiProperty({ required: false })
  readonly global?: boolean;

  @ApiProperty({ required: false })
  readonly authStrategy?: string;
}
