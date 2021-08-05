import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Lifecycle, LifecycleSchema } from './lifecycle.schema';
import { Technique, TechniqueSchema } from './technique.schema';

export type DatasetDocument = Dataset & Document;

@Schema({
  collection: 'Dataset'
})
export class Dataset {
  @ApiProperty({
    type: String,
    name: 'pid',
    default: function genUUID(): string {
      return '20.500.12269/' + uuidv4();
    },
  })
  @Prop({
    type: String,
    alias: 'pid',
    default: function genUUID(): string {
      return '20.500.12269/' + uuidv4();
    },
  })
  _id: string;

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

  @ApiProperty({ type: Lifecycle })
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

  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(Technique) },
  })
  @Prop([TechniqueSchema])
  techniques: Technique[];
}

export const DatasetSchema = SchemaFactory.createForClass(Dataset);

DatasetSchema.virtual('pid')
  .get(function() { return this._id; })
  .set(function(v: any) { this._id = v; });
DatasetSchema.set('toJSON', {
  virtuals: true
});


export enum DatasetType {
  Raw = 'raw',
  Derived = 'derived',
}
