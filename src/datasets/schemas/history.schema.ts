import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type HistoryDocument = HistoryClass & Document;

@Schema({
  strict: false,
  timestamps: {
    createdAt: false,
    updatedAt: true,
  },
})
export class HistoryClass {
  @ApiProperty({
    name: "id",
    type: String,
    required: true,
    default: uuidv4(),
    description:
      "Persistent Identifier for datasets derived from UUIDv4 and prepended automatically by site specific PID prefix like 20.500.12345/",
  })
  @Prop({
    type: String,
    //unique: true,
    required: true,
    default: uuidv4(),
  })
  _id: string;

  /*
   * updated fields are added with the following syntax
   * <field-updated>: {
   *   currentValue: <new-value>
   *   previousValue: <previous-value>
   * }
   *
   * After the migration, we should look in to change the structure
   * to a new one that can be better validated
   */

  @ApiProperty({
    type: Date,
    required: true,
    default: Date.now(),
    description:
      "Time when the update was performed. This field is managed by mongoose with through the timestamp settings. The field should be a string containing a date in ISO 8601 format (2024-02-27T12:26:57.313Z)",
  })
  @Prop({
    type: Date,
    required: true,
    default: Date.now(),
  })
  updatedAt: Date;

  @ApiProperty({
    type: String,
    required: true,
    description: "Username of the user that performed the update.",
  })
  @Prop({
    type: String,
    required: true,
  })
  updatedBy: string;
}

export const HistorySchema = SchemaFactory.createForClass(HistoryClass);
