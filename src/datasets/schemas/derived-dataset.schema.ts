import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class DerivedDataset {
  _id: string;
  owner: string;
  contactEmail: string;
  sourceFolder: string;
  creationTime: Date;
  type: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  investigator: string;

  @ApiProperty()
  @Prop({ type: [String], required: true })
  inputDatasets: string[];

  @ApiProperty()
  @Prop({ type: [String], required: true })
  usedSoftware: string[];

  @ApiProperty()
  @Prop({ type: Object })
  jobParameters: Record<string, any>;

  @ApiProperty()
  @Prop({ type: String })
  jobLogData: string;

  @ApiProperty()
  @Prop({ type: Object })
  scientificMetadata: Record<string, any>;
}

export const DerivedDatasetSchema =
  SchemaFactory.createForClass(DerivedDataset);
