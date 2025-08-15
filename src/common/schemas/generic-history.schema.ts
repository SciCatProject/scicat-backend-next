import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { SchemaTypes } from "mongoose";
import { Types } from "mongoose";

export type GenericHistoryDocument = GenericHistory & Document;

@Schema({
  collection: "History", // Dedicated collection for history
  timestamps: { createdAt: "timestamp", updatedAt: false }, // Only record creation time
  minimize: false,
})
export class GenericHistory {
  @ApiProperty({ description: "The name of the subsystem being tracked" })
  @Prop({ type: String, required: true, index: true })
  subsystem: string;

  @ApiProperty({ description: "The _id of the document that was changed" })
  @Prop({ type: SchemaTypes.Mixed, required: true, index: true })
  documentId: string | number | Types.ObjectId;

  @ApiProperty({ description: "The state of the document before the change" })
  @Prop({ type: Object })
  before?: Record<string, unknown>;

  @ApiProperty({ description: "The state of the document after the change" })
  @Prop({ type: Object })
  after?: Record<string, unknown> | null;

  @ApiProperty({ description: "The type of the operation performed" })
  @Prop({ type: String, required: true, index: true })
  operation: "update" | "delete";

  @ApiProperty({ description: "Timestamp of when the change occurred" })
  @Prop({ type: Date, index: true })
  timestamp: Date; // Automatically managed by timestamps: { createdAt: "timestamp" }

  @ApiProperty({ description: "Username who performed the change" })
  @Prop({ type: String, index: true })
  user?: string; // The user who made the change
}

export const GenericHistorySchema =
  SchemaFactory.createForClass(GenericHistory);

// Add compound indexes if needed for frequent queries
GenericHistorySchema.index({ subsystem: 1, documentId: 1 });
GenericHistorySchema.index({ timestamp: -1 });
