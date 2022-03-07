import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type InstrumentDocument = Instrument & Document;

export class Instrument {
  @Prop({ type: String, unique: true })
  _id: string;

  @ApiProperty({
    type: String,
    default: function genUUID(): string {
      return process.env.PID_PREFIX + uuidv4();
    },
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: function genUUID(): string {
      return process.env.PID_PREFIX + uuidv4();
    },
  })
  pid: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ type: Object, required: false, default: {} })
  @Prop({ type: Object, required: false, default: {} })
  customMetadata: Record<string, unknown>;
}

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);

InstrumentSchema.index({ "$**": "text" });
