import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import * as mongoose from "mongoose";

export type UserRoleDocument = UserRole & mongoose.Document;

@Schema({
  collection: "UserRole",
})
export class UserRole {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: string;

  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Role" })
  roleId: string;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
