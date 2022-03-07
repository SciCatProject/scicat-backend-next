import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LifecycleDocument = Lifecycle & Document;

@Schema()
export class Lifecycle {
  @Prop({ required: false })
  id?: string;

  @Prop({ default: true, required: false, index: true })
  archivable?: boolean;

  @Prop({ default: false, required: false, index: true })
  retrievable?: boolean;

  @Prop({ default: true, required: false, index: true })
  publishable?: boolean;

  @Prop({ type: Date, default: Date.now(), required: false })
  dateOfDiskPurging?: Date;

  @Prop({ type: Date, default: Date.now(), required: false })
  archiveRetentionTime?: Date;

  @Prop({ type: Date, default: Date.now(), required: false })
  dateOfPublishing?: Date;

  @Prop({ type: Date, default: Date.now(), required: false })
  publishedOn?: Date;

  @Prop({ default: true, required: false })
  isOnCentralDisk?: boolean;

  @Prop({ required: false, index: true })
  archiveStatusMessage?: string;

  @Prop({ required: false, index: true })
  retrieveStatusMessage?: string;

  @Prop({ type: Object, required: false })
  archiveReturnMessage?: unknown;

  @Prop({ type: Object, required: false })
  retrieveReturnMessage?: unknown;

  @Prop({ required: false })
  exportedTo?: string;

  @Prop({ default: true, required: false })
  retrieveIntegrityCheck?: boolean;
}

export const LifecycleSchema = SchemaFactory.createForClass(Lifecycle);
