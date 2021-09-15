import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class RawDataset {
  _id: string;
  owner: string;
  contactEmail: string;
  sourceFolder: string;
  creationTime: Date;
  type: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  principalInvestigator: string;

  @ApiProperty()
  @Prop({ type: Date })
  endtime: Date;

  @ApiProperty()
  @Prop({ type: String, required: true })
  creationLocation: string;

  @ApiProperty()
  @Prop({ type: String })
  dataFormat: string;

  @ApiProperty()
  @Prop({ type: Object })
  scientificMetadata: Record<string, any>;
}

export const RawDatasetSchema = SchemaFactory.createForClass(RawDataset);
