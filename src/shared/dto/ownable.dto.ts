import { ApiProperty } from '@nestjs/swagger';

export class OwnableDto {
  @ApiProperty({
    description:
      'Defines the group which owns the data, and therefore has unrestricted access to this data. Usually a pgroup like p12151',
  })
  readonly ownerGroup: string;

  @ApiProperty({
    type: [String],
    description:
      "Optional additional groups which have read access to the data. Users which are member in one of the groups listed here are allowed to access this data. The special group 'public' makes data available to all users",
  })
  readonly accessGroups: string[];

  @ApiProperty({
    description: 'Functional or user account name who created this instance',
  })
  readonly createdBy: string;

  @ApiProperty({
    description:
      'Functional or user account name who last updated this instance',
  })
  readonly updatedBy: string;
}
