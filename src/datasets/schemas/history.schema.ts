import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type HistoryDocument = History & Document;

@Schema({ strict: false })
export class History {
  @Prop({ type: String, required: true, default: uuidv4() })
  _id: string;

  @Prop({ type: Date, required: true, default: Date.now() })
  updatedAt: Date;

  @Prop({ type: String, required: true })
  updatedBy: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
