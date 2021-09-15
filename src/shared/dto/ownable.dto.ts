import { ApiProperty } from '@nestjs/swagger';

export class OwnableDto {
  @ApiProperty()
  readonly ownerGroup: string;

  @ApiProperty({ type: [String] })
  readonly accessGroups: string[];

  @ApiProperty()
  readonly createdBy: string;

  @ApiProperty()
  updatedBy: string;
}
