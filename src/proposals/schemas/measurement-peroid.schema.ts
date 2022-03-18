import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type MeasurementPeriodDocument = MeasurementPeriod & Document;

@Schema()
export class MeasurementPeriod {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Instrument or beamline identifier where measurement was pursued, e.g. /PSI/SLS/TOMCAT",
  })
  @Prop({ type: String, required: true, index: true })
  instrument: string;

  @ApiProperty({
    type: Date,
    description:
      "Time when measurement period started, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server",
  })
  @Prop({ type: Date, index: true })
  start: Date;

  @ApiProperty({
    type: Date,
    description:
      "Time when measurement period ended, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server",
  })
  @Prop({ type: Date, index: true })
  end: Date;

  @ApiProperty({
    type: String,
    description:
      "Additional information relevant for this measurement period, e.g. if different accounts were used for data taking",
  })
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
