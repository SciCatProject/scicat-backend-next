import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Date, Document } from "mongoose";
import { MetricsRecord } from "./metrics-record.schema";

export type MetricsDocument = Metrics & Document;

@Schema({
  collection: "Metrics",
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class Metrics {
  @ApiProperty({
    description: "The date the metric was recorded",
    type: String,
  })
  @Prop({ type: Date, required: false, default: Date.now })
  date: Date;

  @ApiProperty({
    description: "A list of endpoints with their access log compacted details",
    type: [Object],
  })
  @Prop({ type: [MetricsRecord] })
  endpointMetrics: MetricsRecord[];
}

export const MetricsSchema = SchemaFactory.createForClass(Metrics);
