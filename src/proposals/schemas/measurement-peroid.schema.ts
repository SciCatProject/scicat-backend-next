import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MeasurementPeriodDocument = MeasurementPeriod & Document;

@Schema()
export class MeasurementPeriod {
  @Prop({ type: String, required: true, index: true })
  instrument: string;

  @Prop({ type: Date, index: true })
  start: Date;

  @Prop({ type: Date, index: true })
  end: Date;

  @Prop({ type: String })
  comment: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const MeasurementPeriodSchema =
  SchemaFactory.createForClass(MeasurementPeriod);
