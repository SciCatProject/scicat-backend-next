import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LifecycleDocument = Lifecycle & Document;

@Schema()
export class Lifecycle {
  @Prop()
  id: string;

  @Prop({ default: true })
  archivable: boolean;

  @Prop({ default: false })
  retrievable: boolean;

  @Prop({ default: true })
  publishable: boolean;

  @Prop()
  dateOfDiskPurging: Date;

  @Prop()
  archiveRetentionTime: Date;

  @Prop()
  dateOfPublishing: Date;

  @Prop()
  publishedOn: Date;

  @Prop({ default: true })
  isOnCentralDisk: boolean;

  @Prop()
  archiveStatusMessage: string;

  @Prop()
  retrieveStatusMessage: string;

  @Prop()
  archiveReturnMessage: any;

  @Prop()
  retrieveReturnMessage: any;

  @Prop()
  exportedTo: string;

  @Prop({ default: true })
  retrieveIntegrityCheck: boolean;
}

export const LifecycleSchema = SchemaFactory.createForClass(Lifecycle);
