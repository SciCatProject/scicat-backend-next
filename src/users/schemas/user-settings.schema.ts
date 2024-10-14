import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type UserSettingsDocument = UserSettings & Document;

// Define the Condition interface
export interface ScientificCondition {
  field: string;
  value: string;
  operator: string;
}

@Schema({
  collection: "UserSetting",
  toJSON: {
    getters: true,
  },
})
export class UserSettings {
  _id: string;

  id?: string;

  @ApiProperty({
    type: Number,
    default: 25,
    description: "The users preferred number of datasets to view per page",
  })
  @Prop({ type: Number, default: 25 })
  datasetCount: number;

  @ApiProperty({
    type: Number,
    default: 25,
    description: "The users preferred number of jobs to view per page",
  })
  @Prop({ type: Number, default: 25 })
  jobCount: number;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: string;

  @ApiProperty({
    type: "object",
    default: {},
    description:
      "A customizable object for storing the user's external settings, which can contain various nested properties and configurations.",
  })
  @Prop({ type: Object, default: {}, required: false })
  externalSettings: Record<string, unknown>;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
