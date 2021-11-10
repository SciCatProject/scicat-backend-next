import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class Ownable {
  @ApiProperty()
  @Prop({ type: String, index: true })
  ownerGroup: string;

  @ApiProperty()
  @Prop({ type: [String], index: true })
  accessGroups: string[];

  @ApiProperty()
  @Prop({ type: String, index: true })
  createdBy: string;

  @ApiProperty()
  @Prop({ type: String })
  updatedBy: string;
}
