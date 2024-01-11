import { ApiProperty } from "@nestjs/swagger";
import { ReturnedUserDto } from "src/users/dto/returned-user.dto";

export class ReturnedAuthLoginDto {
  @ApiProperty({
    description:
      "JWT token used for authentication and authorization in subsequents calls",
  })
  readonly access_token: string;

  @ApiProperty({
    description:
      "Unique id of this request which matches the JWT token in the field above",
  })
  readonly id: string;

  @ApiProperty({
    description: "Expiration time of the JWT in seconds from creation time",
  })
  readonly expires_in: number | undefined;

  @ApiProperty({
    description: "Time to live of the JWT in seconds from creation time",
  })
  readonly ttl: number | undefined;

  @ApiProperty({
    description: "Date time in ISO 8601 format when the JWT was created",
  })
  readonly created: string;

  @ApiProperty({
    description: "Unique user id of the user logged in",
  })
  readonly userId: string;

  @ApiProperty({
    description: "User information as they are stored in the system",
  })
  readonly user: ReturnedUserDto;
}
