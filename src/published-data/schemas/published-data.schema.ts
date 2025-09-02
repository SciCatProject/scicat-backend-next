import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type PublishedDataDocument = PublishedData & Document;

@Schema({
  collection: "PublishedData",
  toJSON: {
    getters: true,
  },
  timestamps: true,
})
export class PublishedData {
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
  _id: string;

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
    type: String,
    required: false,
    description:
      "Creator Affiliation.  This field has the semantics of" +
      " [DataCite Creator/affiliation](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/creator/#affiliation).",
  })
  @Prop({ type: String, required: false })
  affiliation: string;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "Creator of dataset/dataset collection.  This field has the semantics" +
      " of Dublin Core [dcmi:creator](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/creator/)" +
      " and [DataCite Creator/creatorName](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/creator/#creatorname).",
  })
  @Prop({ type: [String], required: true })
  creator: string[];

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Dataset publisher.  This field has the semantics of Dublin Core" +
      " [dcmi:publisher](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/publisher/)" +
      " and [DataCite publisher](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/publisher).",
  })
  @Prop({ type: String, required: true })
  publisher: string;

  @ApiProperty({
    type: Number,
    required: true,
    description:
      "Year of publication.  This field has the semantics of Dublin Core" +
      " [dcmi:date](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/date/)" +
      " and [DataCite publicationYear](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/publicationyear/).",
  })
  @Prop({ type: Number, required: true })
  publicationYear: number;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "The title of the data.  This field has the semantics of Dublin Core" +
      " [dcmi:title](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/title/)" +
      " and [DataCite title](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/title/).",
  })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Full URL to the landing page for this DOI",
  })
  @Prop({ type: String, required: false })
  url: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Abstract text for published datasets.  This field has the semantics" +
      " of [DataCite description](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/description/)" +
      " with [Abstract descriptionType](https://datacite-metadata-schema.readthedocs.io/en/4.5/appendices/appendix-1/descriptionType/#abstract).",
  })
  @Prop({ type: String, required: true })
  abstract: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Link to description of how to re-use data.  This field has the" +
      " semantics of Dublic Core [dcmi:description](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/description/)" +
      " and [DataCite description](https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/description/)" +
      " with [Abstract descriptionType](https://datacite-metadata-schema.readthedocs.io/en/4.5/appendices/appendix-1/descriptionType/#abstract).",
  })
  @Prop({ type: String, required: true })
  dataDescription: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "e.g. raw/ derived",
  })
  @Prop({ type: String, required: true })
  resourceType: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: "Number of files",
  })
  @Prop({ type: Number, required: false })
  numberOfFiles: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: "Size of archive",
  })
  @Prop({ type: Number, required: false })
  sizeOfArchive: number;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "Array of one or more Dataset persistent identifier (pid) values that" +
      " make up the published data.",
  })
  @Prop({ type: [String], required: true })
  pidArray: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: "List of Names of authors of the to be published data",
  })
  @Prop({ type: [String], required: false })
  authors: string[];

  @ApiProperty({
    type: Date,
    description: "Time when doi is successfully registered",
  })
  @Prop({ type: Date, index: true })
  registeredTime: Date;

  @ApiProperty({
    type: String,
    description:
      "Indication of position in publication workflow e.g. doiRegistered",
  })
  @Prop({ type: String, required: false, default: "pending_registration" })
  status: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "The username of the user that clicks the publish button in the client",
  })
  @Prop({ type: String, required: false })
  scicatUser: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Small, less than 16 MB base 64 image preview of dataset",
  })
  @Prop({ type: String, required: false })
  thumbnail: string;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "List of URLs pointing to related publications like DOI URLS of journal articles",
  })
  @Prop({ type: [String], required: false })
  relatedPublications: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: "URL pointing to page from which data can be downloaded",
  })
  @Prop({ type: String, required: false })
  downloadLink: string;

  @ApiProperty({
    type: Date,
    description:
      "Date when the published data was created. This property is added and maintained by the system",
  })
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description:
      "Date when the published data was last updated. This property is added and maintained by the system",
  })
  @Prop({ type: Date })
  updatedAt: Date;
}

export const PublishedDataSchema = SchemaFactory.createForClass(PublishedData);

PublishedDataSchema.index({ "$**": "text" });
