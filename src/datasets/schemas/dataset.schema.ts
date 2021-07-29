import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Lifecycle, LifecycleSchema } from './lifecycle.schema';
import { Technique, TechniqueSchema } from './technique.schema';

export type DatasetDocument = Dataset & Document;

@Schema()
export class Dataset {
  @ApiProperty()
  @Prop()
  pid: string;

  @ApiProperty()
  @Prop()
  owner: string;

  @ApiProperty()
  @Prop()
  ownerEmail: string;

  @ApiProperty()
  @Prop()
  orcidOfOwner: string;

  @ApiProperty()
  @Prop()
  contactEmail: string;

  @ApiProperty()
  @Prop()
  sourceFolder: string;

  @ApiProperty()
  @Prop()
  sourceFolderHost: string;

  @ApiProperty()
  @Prop()
  size: number;

  @ApiProperty()
  @Prop()
  packedSize: number;

  @ApiProperty()
  @Prop()
  numberOfFiles: number;

  @ApiProperty()
  @Prop()
  numberOfFilesArchived: number;

  @ApiProperty()
  @Prop()
  creationTime: Date;

  @ApiProperty()
  @Prop()
  type: DatasetType;

  @ApiProperty()
  @Prop()
  validationStatus: string;

  @ApiProperty()
  @Prop([String])
  keywords: string[];

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop()
  datasetName: string;

  @ApiProperty()
  @Prop()
  classification: string;

  @ApiProperty()
  @Prop()
  license: string;

  @ApiProperty()
  @Prop()
  version: string;

  @ApiProperty()
  @Prop({ default: false })
  isPublished: boolean;

  @ApiProperty()
  @Prop()
  ownerGroup: string;

  @ApiProperty()
  @Prop([String])
  accessGroups: string[];

  @ApiProperty()
  @Prop()
  createdBy: string;

  @ApiProperty()
  @Prop()
  updatedBy: string;

  @ApiProperty()
  @Prop([Object])
  history: any[];

  @ApiProperty()
  @Prop({ type: LifecycleSchema })
  datasetlifecycle: Lifecycle;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;

  @ApiProperty()
  @Prop()
  instrumentId: string;

  @ApiProperty()
  @Prop([TechniqueSchema])
  techniques: Technique[];
}

export const DatasetSchema = SchemaFactory.createForClass(Dataset);

export enum DatasetType {
  Raw = 'raw',
  Derived = 'derived',
}
