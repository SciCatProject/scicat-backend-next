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

  @ApiProperty({
    type: String,
    required: true,
    description: "Email of principal investigator",
  })
  @Prop({ type: String, required: true })
  principalInvestigator: string;

  @ApiProperty({
    type: Date,
    required: false,
    description:
      "Time of end of data taking for this dataset, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server",
  })
  @Prop({ type: Date, required: false })
  endTime: Date;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Unique location identifier where data was taken, usually in the form /Site-name/facility-name/instrumentOrBeamline-name",
  })
  @Prop({ type: String, required: true, index: true })
  creationLocation: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Defines format of subsequent scientific meta data, e.g Nexus Version x.y",
  })
  @Prop({ type: String, required: false })
  dataFormat: string;

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
    description: "JSON object containing the scientific metadata",
  })
  @Prop({ type: Object, required: false, default: {} })
  scientificMetadata: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "The ID of the proposal to which the dataset belongs.",
  })
  @Prop({ type: String, ref: "Proposal", required: false })
  proposalId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "ID of the sample used when collecting the data.",
  })
  @Prop({ type: String, ref: "Sample", required: false })
  sampleId: string;
}

export const RawDatasetSchema = SchemaFactory.createForClass(RawDataset);
