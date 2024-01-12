import { ApiProperty } from "@nestjs/swagger";

export class ReturnedUserDto {
  @ApiProperty({
    description: "Unique id of the user assigned by system",
  })
  readonly id: string;

  @ApiProperty({
    description: "Username of the user",
  })
  readonly username: string;

  @ApiProperty({
    description: "Email associated to this user",
  })
  readonly email: string;

  @ApiProperty({
    description: "Email has been verified",
  })
  readonly emailVerified: boolean;

  @ApiProperty({
    description: "Where the info of this user are stored",
  })
  readonly realm: string;

  @ApiProperty({
    description: "Strategy used to authenticate this user",
  })
  readonly authStrategy: string;
}
