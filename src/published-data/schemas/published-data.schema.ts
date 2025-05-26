import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { QueryableClass } from "src/common/schemas/queryable.schema";
import { v4 as uuidv4 } from "uuid";
import { PublishedDataStatus } from "../interfaces/published-data.interface";

export type PublishedDataDocument = PublishedData & Document;

@Schema({
  collection: "PublishedData",
  toJSON: {
    getters: true,
  },
  timestamps: true,
})
export class PublishedData extends QueryableClass {
  @Prop({
    type: String,
  })
  _id: string;

  @Prop({
    type: String,
    default: function genUUID(): string {
      return (
        (process.env.DOI_PREFIX
          ? process.env.DOI_PREFIX.replace(/\/$/, "")
          : "undefined") +
        "/" +
        uuidv4()
      );
    },
  })
  pid: string;

  @ApiProperty({
    type: String,
    description:
      "Digital Object Identifier; e.g.," +
      ' "10.xxx/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d".',
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: function genUUID(): string {
      return (
        (process.env.DOI_PREFIX
          ? process.env.DOI_PREFIX.replace(/\/$/, "")
          : "undefined") +
        "/" +
        uuidv4()
      );
    },
  })
  doi: string;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "The main researchers involved in producing the data, or the authors of the publication, in priority order. This field has the semantics" +
      " of Dublin Core [dcmi:creator](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/creator/)" +
      " and [DataCite Creator/creatorName](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/creator/#creatorname).",
  })
  @Prop({ type: [String], required: true })
  creators: string[];

  @ApiProperty({
    type: String,
    required: true,
    description:
      "The name of the entity that holds, archives, publishes, prints, distributes, releases, issues, or produces the resource. This field has the semantics of Dublin Core" +
      " [dcmi:publisher](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/publisher/)" +
      " and [DataCite publisher](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/publisher).",
  })
  @Prop({ type: String, required: true })
  publisher: string;

  @ApiProperty({
    type: Number,
    required: true,
    description:
      "The year when the data was or will be made publicly available. This field has the semantics of Dublin Core" +
      " [dcmi:date](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/date/)" +
      " and [DataCite publicationYear](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/publicationyear/).",
  })
  @Prop({ type: Number, required: true })
  publicationYear: number;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "A name or title by which a resource is known. This field has the semantics of Dublin Core" +
      " [dcmi:title](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/title/)" +
      " and [DataCite title](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/title/).",
  })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Full URL to the landing page for this DOI",
  })
  @Prop({ type: String, required: false })
  url?: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "A brief description of the resource and the context in which the resource was created. This field has the semantics" +
      " of [DataCite description](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/description/)" +
      " with [Abstract descriptionType](https://datacite-metadata-schema.readthedocs.io/en/4.6/appendices/appendix-1/descriptionType/#abstract).",
  })
  @Prop({ type: String, required: true })
  abstract: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Link to description of how to re-use data. Intended for information not shared with DataCite",
  })
  @Prop({ type: String, required: false })
  dataDescription?: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Free text. This field has the semantics of [DataCite resourceType](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/resourcetype/)",
  })
  @Prop({ type: String, required: true })
  resourceType: string;

  @ApiProperty({
    type: Number,
    required: false,
    description:
      "Number of files. Managed by the system and calculated from the datasetPids array",
  })
  @Prop({ type: Number, required: false })
  numberOfFiles?: number;

  @ApiProperty({
    type: Number,
    required: false,
    description:
      "Size of archive. Managed by the system and calculated from the datasetPids array",
  })
  @Prop({ type: Number, required: false })
  sizeOfArchive?: number;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "Array of one or more Dataset persistent identifier (pid) values that" +
      " make up the published data.",
  })
  @Prop({ type: [String], required: true })
  datasetPids: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "The institution or person responsible for collecting, managing, distributing, or otherwise contributing to the development of the resource." +
      "This field has the semantics of [DataCite contributor](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/contributor/)",
  })
  @Prop({ type: [String], required: false })
  contributors?: string[];

  @ApiProperty({
    type: Date,
    required: false,
    description: "Time when doi is successfully registered",
  })
  @Prop({ type: Date, index: true, required: false })
  registeredTime?: Date;

  @ApiProperty({
    enum: PublishedDataStatus,
    description:
      "Indication of position in publication workflow e.g. registred, private, public",
  })
  @Prop({
    type: String,
    required: false,
    default: PublishedDataStatus.PRIVATE,
    enum: PublishedDataStatus,
  })
  status?: PublishedDataStatus;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "Identifiers of related resources. This field has the semantics of [DataCite relatedIdentifier](https://datacite-metadata-schema.readthedocs.io/en/4.6/properties/relatedidentifier/)",
  })
  @Prop({ type: [String], required: false })
  relatedPublications?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "Subject, keyword, classification code, or key phrase describing the resource.",
  })
  @Prop({ type: [String], required: false })
  keywords?: string[];

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
    description:
      "JSON object containing the metadata. This will cover most optional fields of the DataCite schema, and will require a mapping from metadata subfields to DataCite Schema definitions",
  })
  @Prop({ type: Object, required: false, default: {} })
  metadata?: Record<string, unknown>;
}

export const PublishedDataSchema = SchemaFactory.createForClass(PublishedData);

PublishedDataSchema.index({ "$**": "text" });
