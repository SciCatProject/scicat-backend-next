import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type RuntimeConfigDocument = RuntimeConfig & Document;

@Schema({
  collection: "RuntimeConfig",
  timestamps: true,
})
export class RuntimeConfig {
  @ApiProperty({
    type: String,
    description: "Unique config identifier (e.g. 'frontend', 'backend', etc.)",
  })
  @Prop({ type: String, unique: true, required: true, index: true })
  cid: string;

  @ApiProperty({
    type: Object,
    description: " configuration data stored as JSON",
  })
  @Prop({ type: Object, required: true, default: {} })
  data: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "User or system that last updated the configuration",
  })
  @Prop({ type: String, required: true, default: "system" })
  updatedBy: string;
}

export const RuntimeConfigSchema = SchemaFactory.createForClass(RuntimeConfig);
