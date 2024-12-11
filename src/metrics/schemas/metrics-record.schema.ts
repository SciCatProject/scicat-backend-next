import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

@Schema()
export class MetricsRecord {
  @ApiProperty({
    description: "The endpoint path being tracked",
    type: String,
  })
  @Prop({ type: String, required: true })
  endpoint: string;

  @ApiProperty({
    description: "The records of individual access logs for this endpoint",
    type: [Object],
  })
  @Prop({
    type: [
      {
        userId: { type: String, required: false },
        statusCode: { type: Number, required: true },
        date: { type: Date, required: true },
      },
    ],
    required: true,
  })
  records: Array<{
    userId: string | null;
    statusCode: number;
    date: Date;
  }>;

  @ApiProperty({
    description: "Summary statistics of access for this endpoint",
    type: Object,
  })
  @Prop({ type: Object, required: true })
  summary: {
    totalRequests: number;
  };
}

// Create the schema for MetricsRecord
export const MetricsRecordSchema = SchemaFactory.createForClass(MetricsRecord);

// If needed, export the type
export type MetricsRecordDocument = MetricsRecord & Document;
