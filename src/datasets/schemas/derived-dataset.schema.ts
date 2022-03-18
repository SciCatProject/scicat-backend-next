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

  @ApiProperty({
    type: String,
    description:
      "Email of person pursuing the data analysis. The string may contain a list of emails, which should then be separated by semicolons",
  })
  @Prop({ type: String, required: true, index: true })
  investigator: string;

  @ApiProperty({
    type: [String],
    description:
      "Array of input dataset identifiers used in producing the derived dataset. Ideally these are the global identifier to existing datasets inside this or federated data catalogs",
  })
  @Prop({ type: [String], required: true })
  inputDatasets: string[];

  @ApiProperty({
    type: [String],
    description:
      "A list of links to software repositories which uniquely identifies the software used and the version for yielding the derived data",
  })
  @Prop({ type: [String], required: true })
  usedSoftware: string[];

  @ApiProperty({
    type: Object,
    description:
      "The creation process of the drived data will usually depend on input job parameters. The full structure of these input parameters are stored here",
  })
  @Prop({ type: Object })
  jobParameters: Record<string, unknown>;

  @ApiProperty({
    type: String,
    description:
      "The output job logfile. Keep the size of this log data well below 15 MB ",
  })
  @Prop({ type: String })
  jobLogData: string;

  @ApiProperty({
    type: Object,
    description: "JSON object containing the scientific meta data",
  })
  @Prop({ type: Object })
  scientificMetadata: Record<string, unknown>;
}

export const DerivedDatasetSchema =
  SchemaFactory.createForClass(DerivedDataset);
