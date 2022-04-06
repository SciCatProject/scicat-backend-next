import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import * as mongoose from "mongoose";
import { UserSettings, UserSettingsSchema } from "./user-settings.schema";

export type UserDocument = User & mongoose.Document;

@Schema({
  collection: "User",
})
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, unique: true })
  _id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, unique: true })
  id?: string;

  @ApiProperty()
  @Prop({ required: false })
  realm: string;

  @ApiProperty()
  @Prop({ required: true })
  username: string;

  @ApiProperty()
  @Prop({ required: false })
  password: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty()
  @Prop({ required: false })
  emailVerified: boolean;

  @ApiProperty()
  @Prop({ type: UserSettingsSchema })
  userSettings: UserSettings;
}

export const UserSchema = SchemaFactory.createForClass(User);
