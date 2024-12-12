import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Document } from "mongoose";

export type AccessLogDocument = AccessLog & Document;

@Schema({
  collection: "AccessLog",
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
@Schema()
export class AccessLog {
  @ApiPropertyOptional({
    description: "User ID associated with the access log",
    type: String,
  })
  @Prop({ type: String, default: null })
  userId: string | null;

  @ApiPropertyOptional({
    description: "The timestamp when the document was created",
    type: Date,
  })
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

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
    description: "Endpoint for the request",
    type: Object,
  })
  @Prop({ type: Object, default: null })
  query: object;

  @ApiPropertyOptional({
    description: "Original IP of the user for the request",
    type: String,
  })
  @Prop({ type: String, default: "Not found" })
  originIp: string | undefined;

  @ApiProperty({
    description: "Response time in ms for the request",
    type: String,
  })
  @Prop({ type: Number, required: true })
  responseTime: number;
}

export const AccessLogSchema = SchemaFactory.createForClass(AccessLog);

AccessLogSchema.index({ createdAt: 1 });
