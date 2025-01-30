import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { QueryableClass } from "src/common/schemas/queryable.schema";

export type MeasurementPeriodDocument = MeasurementPeriodClass & Document;

@Schema()
export class MeasurementPeriodClass extends QueryableClass {
  /**
   * Instrument or beamline identifier where measurement was pursued, e.g. /PSI/SLS/TOMCAT
   */
  @Prop({ type: String, required: true, index: true })
  instrument: string;

  /**
   * Time when measurement period started, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.
   */
  @Prop({ type: Date, index: true })
  start: Date;

  /**
   * Time when measurement period ended, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.
   */
  @Prop({ type: Date, index: true })
  end: Date;

  /**
   * Additional information relevant for this measurement period, e.g. if different accounts were used for data taking.
   */
  @Prop({ type: String })
  comment: string;
}

export const MeasurementPeriodSchema = SchemaFactory.createForClass(
  MeasurementPeriodClass,
);
