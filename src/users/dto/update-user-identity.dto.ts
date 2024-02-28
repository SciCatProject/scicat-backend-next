import { ApiProperty } from "@nestjs/swagger";
import { UserProfile } from "../schemas/user-profile.schema";

export class UpdateUserIdentityDto {
  @ApiProperty()
  readonly profile: UserProfile;

  @ApiProperty()
  readonly credentials?: Record<string, unknown>;

  @ApiProperty()
  readonly externalId?: string;

  @ApiProperty()
  readonly provider?: string;
}
