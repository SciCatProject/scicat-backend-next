import { ApiProperty } from '@nestjs/swagger';
import { UserProfile } from '../schemas/user-profile.schema';

export class CreateUserIdentityDto {
  @ApiProperty()
  authScheme: string;

  @ApiProperty()
  created: Date;

  @ApiProperty()
  credentials: any;

  @ApiProperty()
  externalId: string;

  @ApiProperty()
  modified: Date;

  @ApiProperty()
  profile: UserProfile;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  userId: string;
}
