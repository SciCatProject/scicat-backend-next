import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type DataFileDocument = DataFile & Document;

@Schema()
export class DataFile {
  @ApiProperty()
  @Prop({ type: String, required: true })
  path: string;

  @ApiProperty()
  @Prop()
  size: number;

  @ApiProperty()
  @Prop()
  time: Date;

  @ApiProperty()
  @Prop()
  chk: string;

  @ApiProperty()
  @Prop()
  uid: string;

  @ApiProperty()
  @Prop()
  gid: string;

  @ApiProperty()
  @Prop()
  perm: string;
}

export const DataFileSchema = SchemaFactory.createForClass(DataFile);
