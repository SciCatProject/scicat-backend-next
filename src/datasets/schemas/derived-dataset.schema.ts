import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Lifecycle } from "./lifecycle.schema";
import { Technique } from "./technique.schema";

@Schema()
export class DerivedDataset {
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
  jobParameters: Record<string, unknown>;

  @ApiProperty()
  @Prop({ type: String })
  jobLogData: string;

  @ApiProperty()
  @Prop({ type: Object })
  scientificMetadata: Record<string, unknown>;
}

export const DerivedDatasetSchema =
  SchemaFactory.createForClass(DerivedDataset);
