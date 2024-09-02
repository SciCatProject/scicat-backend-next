import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type UserSettingsDocument = UserSettings & Document;

// Define possible filter component types as a union of string literals
export type FilterComponentType =
  | "LocationFilterComponent"
  | "PidFilterComponent"
  | "PidFilterContainsComponent"
  | "PidFilterStartsWithComponent"
  | "GroupFilterComponent"
  | "TypeFilterComponent"
  | "KeywordFilterComponent"
  | "DateRangeFilterComponent"
  | "TextFilterComponent";

// Define the Filter interface
export interface FilterConfig {
  type: FilterComponentType;
  visible: boolean;
}

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
    type: [Object],
    default: [],
    description: "Array of the users preferred columns in dataset table",
  })
  @Prop({ type: [Object], default: [] })
  columns: Record<string, unknown>[];

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
    type: [Object],
    default: [],
    description: "Array of filters the user has set",
  })
  @Prop({
    type: [{ type: Object }],
    default: [],
  })
  filters: FilterConfig[];

  @ApiProperty({
    type: [Object],
    default: [],
    description: "Array of conditions the user has set",
  })
  @Prop({ type: [{ type: Object }], default: [] })
  conditions: ScientificCondition[];
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
