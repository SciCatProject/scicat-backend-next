import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Date, Document } from "mongoose";
import { MetricsRecord } from "./metrics-record.schema";

export type MetricsDocument = Metrics & Document;

@Schema({
  collection: "Metrics",
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class Metrics {
  @ApiPropertyOptional({
    description: "The date the metric was recorded",
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @ApiProperty({
    description: "A list of endpoints with their access log compacted details",
    type: [Object],
  })
  @Prop({ type: [MetricsRecord] })
  endpointMetrics: MetricsRecord[];
}

export const MetricsSchema = SchemaFactory.createForClass(Metrics);
