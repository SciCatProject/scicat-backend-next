import { ApiProperty } from "@nestjs/swagger";
import { UserProfile } from "../schemas/user-profile.schema";

export class CreateUserIdentityDto {
  @ApiProperty()
  readonly authScheme: string;

  @ApiProperty()
  readonly created: Date;

  @ApiProperty()
  readonly credentials: Record<string, unknown>;

  @ApiProperty()
  readonly externalId: string;

  @ApiProperty()
  readonly modified: Date;

  @ApiProperty()
  readonly profile: UserProfile;

  @ApiProperty()
  readonly provider: string;

  @ApiProperty()
  readonly userId: string;
}
