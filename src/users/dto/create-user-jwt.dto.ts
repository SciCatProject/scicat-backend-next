import { ApiProperty } from "@nestjs/swagger";

export class CreateUserJWT {
  @ApiProperty()
  readonly jwt: string;
}
