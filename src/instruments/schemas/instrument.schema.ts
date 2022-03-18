import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import { Dataset } from "src/datasets/schemas/dataset.schema";
import { v4 as uuidv4 } from "uuid";

export type InstrumentDocument = Instrument & Document;

@Schema({
  collection: "Instrument",
})
export class Instrument {
  @Prop({ type: String, unique: true })
  _id: string;

  @ApiProperty({
    type: String,
    default: function genUUID(): string {
      return process.env.PID_PREFIX + uuidv4();
    },
    required: true,
    description: "PID of the instrument",
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

  @ApiProperty({
    type: String,
    required: true,
    description: "The name of the instrument.",
  })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
    description: "JSON object containing custom metadata",
  })
  @Prop({ type: Object, required: false, default: {} })
  customMetadata: Record<string, unknown>;

  @ApiProperty({ type: "array", items: { $ref: getSchemaPath(Dataset) } })
  @Prop([Dataset])
  datasets: Dataset[];
}

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);

InstrumentSchema.index({ "$**": "text" });
