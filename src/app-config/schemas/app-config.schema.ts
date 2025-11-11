import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type AppConfigDocument = AppConfig & Document;

@Schema({
  collection: "AppConfig",
  timestamps: true,
})
export class AppConfig {
  @ApiProperty({
    type: String,
    description: "Unique config identifier (e.g. 'frontend', 'backend', etc.)",
  })
  @Prop({ type: String, unique: true, required: true })
  _id: string;

  @ApiProperty({
    type: Object,
    description: "Configuration content as a JSON object",
  })
  @Prop({ type: Object, required: true, default: {} })
  value: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "Optional description of this configuration entry",
  })
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "User or system that last updated the configuration",
  })
  @Prop({ type: String, required: true, default: "system" })
  updatedBy: string;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
