import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type UserSettingsDocument = UserSettings & Document;

@Schema({
  collection: "UserSetting",
})
export class UserSettings {
  @Prop({ type: String, unique: true, default: () => uuidv4() })
  _id: string;

  @ApiProperty({ type: String, default: () => uuidv4() })
  @Prop({ type: String, unique: true, required: true, default: () => uuidv4() })
  id: string;

  @ApiProperty()
  @Prop([Object])
  columns: Record<string, unknown>[];

  @ApiProperty()
  @Prop({ type: Number, default: 25 })
  datasetCount: number;

  @ApiProperty()
  @Prop({ type: Number, default: 25 })
  jobCount: number;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: string;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
