import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ApiProperty} from "@nestjs/swagger";
import {Document} from "mongoose";
import {v4 as uuidv4} from "uuid";

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

  @ApiProperty({type: String, description: "Digital Object Identifier"})
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
    description: "Creator Affiliation",
  })
  @Prop({type: String, required: false})
  affiliation: string;

  @ApiProperty({
    type: [String],
    required: true,
    description: "Creator of dataset/dataset collection",
  })
  @Prop({type: [String], required: true})
  creator: string[];

  @ApiProperty({
    type: String,
    required: true,
    description: "Dataset publisher",
  })
  @Prop({type: String, required: true})
  publisher: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: "Year of publication ",
  })
  @Prop({type: Number, required: true})
  publicationYear: number;

  @ApiProperty({type: String, required: true, description: "Title"})
  @Prop({type: String, required: true})
  title: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Full URL to the landing page for this DOI",
  })
  @Prop({type: String, required: false})
  url: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Abstract text for published datasets",
  })
  @Prop({type: String, required: true})
  abstract: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Link to description of how to re-use data",
  })
  @Prop({type: String, required: true})
  dataDescription: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "e.g. raw/ derived",
  })
  @Prop({type: String, required: true})
  resourceType: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: "Number of files",
  })
  @Prop({type: Number, required: false})
  numberOfFiles: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: "Size of archive",
  })
  @Prop({type: Number, required: false})
  sizeOfArchive: number;

  @ApiProperty({
    type: [String],
    required: true,
    description: "Array of one or more PIDS which make up the published data",
  })
  @Prop({type: [String], required: true})
  pidArray: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: "List of Names of authors of the to be published data",
  })
  @Prop({type: [String], required: false})
  authors: string[];

  @ApiProperty({
    type: Date,
    description: "Time when doi is successfully registered",
  })
  @Prop({type: Date, index: true})
  registeredTime: Date;

  @ApiProperty({
    type: String,
    description:
      "Indication of position in publication workflow e.g. doiRegistered",
  })
  @Prop({type: String, required: false})
  status: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "The username of the user that clicks the publish button in the client",
  })
  @Prop({type: String, required: false})
  scicatUser: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Small, less than 16 MB base 64 image preview of dataset",
  })
  @Prop({type: String, required: false})
  thumbnail: string;

  @ApiProperty({
    type: [String],
    required: false,
    description:
      "List of URLs pointing to related publications like DOI URLS of journal articles",
  })
  @Prop({type: [String], required: false})
  relatedPublications: string[];

  @ApiProperty({
    type: String,
    required: false,
    description: "URL pointing to page from which data can be downloaded",
  })
  @Prop({type: String, required: false})
  downloadLink: string;

  @ApiProperty({
    type: Date,
    description:
      "Date when the published data was created. This property is added and maintained by the system",
  })
  @Prop({type: Date})
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description:
      "Date when the published data was last updated. This property is added and maintained by the system",
  })
  @Prop({type: Date})
  updatedAt: Date;
}

export const PublishedDataSchema = SchemaFactory.createForClass(PublishedData);

PublishedDataSchema.index({"$**": "text"});
