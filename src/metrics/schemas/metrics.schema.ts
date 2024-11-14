import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, Document } from "mongoose";

export type MetricsDocument = MetricsClass & Document;

class Documentation {
  @Prop({ required: true })
  pid: string;

  @Prop({ type: Number, default: 0 })
  count: number;
}

class DatasetEvent {
  @Prop({ type: Number, default: 0 })
  publicDataCount: number;

  @Prop({ type: Number, default: 0 })
  privateDataCount: number;

  @Prop({ type: [Documentation], default: [] })
  documentations: Documentation[];
}

class QueryEvent {
  @Prop({ type: Number, default: 0 })
  count: number;
}

class Events {
  @Prop({ type: DatasetEvent, default: {} })
  datasetsView: DatasetEvent;

  @Prop({ type: Number, default: {} })
  datasetsQuery: QueryEvent;

  @Prop({ type: DatasetEvent, default: {} })
  datasetsDownload: DatasetEvent;
}

@Schema({
  collection: "metrics",
  timestamps: true,
})
export class MetricsClass {
  @Prop({ required: true })
  date: Date; // e.g., "2023-11-12"

  @Prop({ type: Events, default: {} })
  events: Events;
}

export const MetricsSchema = SchemaFactory.createForClass(MetricsClass);
