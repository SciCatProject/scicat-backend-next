import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Lifecycle } from "./lifecycle.schema";
import { Technique } from "./technique.schema";

@Schema()
export class RawDataset {
  pid: string;
  owner: string;
  ownerEmail: string;
  orcidOfOwner: string;
  contactEmail: string;
  sourceFolder: string;
  sourceFolderHost: string;
  size: number;
  packedSize: number;
  numberOfFiles: number;
  numberOfFilesArchived: number;
  creationTime: Date;
  type: string;
  validationStatus: string;
  keywords: string[];
  description: string;
  datasetName: string;
  classification: string;
  license: string;
  version: string;
  isPublished: boolean;
  history: Record<string, unknown>;
  datasetLifeCycle: Lifecycle;
  createdAt: Date;
  updatedAt: Date;
  techniques: Technique[];

  @ApiProperty()
  @Prop({ type: String, required: true })
  principalInvestigator: string;

  @ApiProperty()
  @Prop({ type: Date })
  endTime: Date;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  creationLocation: string;

  @ApiProperty()
  @Prop({ type: String })
  dataFormat: string;

  @ApiProperty()
  @Prop({ type: Object })
  scientificMetadata: Record<string, unknown>;
}

export const RawDatasetSchema = SchemaFactory.createForClass(RawDataset);
