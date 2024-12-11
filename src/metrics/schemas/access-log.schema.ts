import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Document } from "mongoose";

export type AccessLogsDocument = AccessLogs & Document;

// Define the structure of the AccessLogSchema
@Schema()
export class AccessLogs {
  @ApiProperty({
    description: "User ID associated with the access log",
    type: String,
  })
  @Prop({ type: String, default: null })
  userId: string | null;

  @ApiProperty({
    description: "HTTP status code for the request",
    type: Number,
  })
  @Prop({ type: Number, required: true })
  statusCode: number;

  @ApiProperty({
    description: "Endpoint for the request",
    type: String,
  })
  @Prop({ type: String, required: true })
  endpoint: string;

  @ApiPropertyOptional({
    description: "Original IP of the user for the request",
    type: String,
  })
  @Prop({ type: String, required: true })
  originIp: string;
}

export const AccessLogSchema = SchemaFactory.createForClass(AccessLogs);

AccessLogSchema.index({ createdAt: 1 });
