import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type RoleDocument = Role & Document;

@Schema({
  collection: "Role",
})
export class Role {
  @Prop({ type: String, unique: true })
  _id: string;

  @ApiProperty()
  @Prop({ unique: true })
  name: string;

  @ApiProperty()
  @Prop()
  created: Date;

  @ApiProperty()
  @Prop()
  modified: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
