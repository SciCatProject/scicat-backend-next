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
  /*
  id: string;

  @Prop({
    type: String,
  })
  */
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
    description: "Time when the update was performed.",
  })
  @Prop({
    type: Date,
    required: true,
    default: Date.now(),
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    required: true,
    default: Date.now(),
    description: "Username of the user that performed the update.",
  })
  @Prop({
    type: String,
    required: true,
  })
  updatedBy: string;
}

export const HistorySchema = SchemaFactory.createForClass(HistoryClass);
