import * as mongoose from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ApiProperty} from "@nestjs/swagger";
import {Document} from "mongoose";

export type UserSettingsDocument = UserSettings & Document;

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
    type: [Object],
    default: [],
    description: "Array of the users preferred columns in dataset table",
  })
  @Prop({type: [Object], default: []})
  columns: Record<string, unknown>[];

  @ApiProperty({
    type: Number,
    default: 25,
    description: "The users preferred number of datasets to view per page",
  })
  @Prop({type: Number, default: 25})
  datasetCount: number;

  @ApiProperty({
    type: Number,
    default: 25,
    description: "The users preferred number of jobs to view per page",
  })
  @Prop({type: Number, default: 25})
  jobCount: number;

  @ApiProperty({type: String, required: true})
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "User", required: true})
  userId: string;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
