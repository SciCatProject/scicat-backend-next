import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Lifecycle, LifecycleSchema } from './lifecycle.schema';
import { Technique, TechniqueSchema } from './technique.schema';

export type DatasetDocument = Dataset & Document;

@Schema()
export class Dataset {
  @Prop()
  pid: string;

  @Prop()
  owner: string;

  @Prop()
  ownerEmail: string;

  @Prop()
  orcidOfOwner: string;

  @Prop()
  contactEmail: string;

  @Prop()
  sourceFolder: string;

  @Prop()
  sourceFolderHost: string;

  @Prop()
  size: number;

  @Prop()
  packedSize: number;

  @Prop()
  numberOfFiles: number;

  @Prop()
  numberOfFilesArchived: number;

  @Prop()
  creationTime: Date;

  @Prop()
  type: string;

  @Prop()
  validationStatus: string;

  @Prop([String])
  keywords: string[];

  @Prop()
  description: string;

  @Prop()
  datasetName: string;

  @Prop()
  classification: string;

  @Prop()
  license: string;

  @Prop()
  version: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  ownerGroup: string;

  @Prop([String])
  accessGroups: string[];

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

  @Prop([Object])
  history: any[];

  @Prop({ type: LifecycleSchema })
  datasetlifecycle: Lifecycle;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  instrumentId: string;

  @Prop([TechniqueSchema])
  techniques: Technique[];
}

export const DatasetSchema = SchemaFactory.createForClass(Dataset);
