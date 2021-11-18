import { ApiProperty } from "@nestjs/swagger";

export class CredentialsDto {
  @ApiProperty({ required: true, description: "The username of the user" })
  readonly username: string;

  @ApiProperty({ required: true, description: "The password of the user" })
  readonly password: string;
}
