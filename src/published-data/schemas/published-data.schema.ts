import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type PublishedDataDocument = PublishedData & Document;

@Schema({
  collection: "PublishedData",
})
export class PublishedData {
  @Prop({ type: String, unique: true })
  _id: string;

  @ApiProperty()
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: function genUUID(): string {
      return process.env.DOI_PREFIX + uuidv4();
    },
  })
  doi: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  affiliation: string;

  @ApiProperty()
  @Prop({ type: [String], required: true })
  creator: string[];

  @ApiProperty()
  @Prop({ type: String, required: true })
  publisher: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  publicationYear: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  url: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  abstract: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  dataDescription: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  resourceType: string;

  @ApiProperty()
  @Prop({ type: Number, required: false })
  numberOfFiles: number;

  @ApiProperty()
  @Prop({ type: Number, required: false })
  sizeOfArchive: number;

  @ApiProperty()
  @Prop({ type: [String], required: true })
  pidArray: string[];

  @ApiProperty()
  @Prop({ type: [String], required: false })
  authors: string[];

  @ApiProperty()
  @Prop({ type: Date, index: true })
  registeredTime: Date;

  @ApiProperty()
  @Prop({ type: String, required: false })
  status: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  scicatUser: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  thumbnail: string;

  @ApiProperty()
  @Prop({ type: [String], required: false })
  relatedPublications: string[];

  @ApiProperty()
  @Prop({ type: String, required: false })
  downloadLink: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  updatedAt: Date;
}

export const PublishedDataSchema = SchemaFactory.createForClass(PublishedData);
