import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

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
    required: false,
  })
  @IsOptional()
  readonly emailVerified?: boolean;

  @ApiProperty({
    description: "Where the info of this user are stored",
    required: false,
  })
  @IsOptional()
  readonly realm?: string;

  @ApiProperty({
    description: "Strategy used to authenticate this user",
  })
  readonly authStrategy: string;
}
