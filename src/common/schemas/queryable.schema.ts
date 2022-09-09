import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class Queryable {
  @ApiProperty()
  @Prop({ type: String, index: true })
  createdBy: string;

  @ApiProperty()
  @Prop({ type: String })
  updatedBy: string;

  @ApiProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}
