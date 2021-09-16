import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class Ownable {
  @ApiProperty()
  @Prop()
  ownerGroup: string;

  @ApiProperty()
  @Prop([String])
  accessGroups: string[];

  @ApiProperty()
  @Prop()
  createdBy: string;

  @ApiProperty()
  @Prop()
  updatedBy: string;
}
