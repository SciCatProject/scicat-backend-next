import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import {
  Attachment,
  AttachmentSchema,
} from "src/attachments/schemas/attachment.schema";
import { OwnableClass } from "src/common/schemas/ownable.schema";
import {
  MeasurementPeriod,
  MeasurementPeriodSchema,
} from "./measurement-period.schema";

export type ProposalDocument = Proposal & Document;
@Schema({
  collection: "Proposal",
  toJSON: {
    getters: true,
  },
})
export class Proposal extends OwnableClass {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Globally unique identifier of a proposal, eg. PID-prefix/internal-proposal-number. PID prefix is auto prepended",
  })
  @Prop({ type: String, unique: true, required: true })
  proposalId: string;

  @Prop({ type: String })
  _id: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Email of principal investigator",
  })
  @Prop({
    type: String,
    required: false,
    index: true,
  })
  pi_email: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "First name of principal investigator",
  })
  @Prop()
  pi_firstname: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Last name of principal investigator",
  })
  @Prop()
  pi_lastname: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Email of main proposer",
  })
  @Prop({ type: String, required: true })
  email: string;

  @ApiProperty({ type: String, description: "First name of main proposer" })
  @Prop({ type: String, required: false })
  firstname: string;

  @ApiProperty({ type: String, description: "Last name of main proposer" })
  @Prop({ type: String, required: false })
  lastname: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "The title of the proposal",
  })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, description: "The proposal abstract" })
  @Prop({ type: String, required: false })
  abstract: string;

  @ApiProperty({
    type: Date,
    required: false,
    description: "The date when the data collection starts",
  })
  @Prop({ type: Date, required: false })
  startTime: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description: "The date when data collection finishes",
  })
  @Prop({ type: Date, required: false })
  endTime: Date;

  /* @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(Attachment) },
    required: false,
    description:
      "Small less than 16 MB attachments, envisaged for png/jpeg previews",
  })
  @Prop({
    type: [AttachmentSchema],
    required: false,
  })
  attachments: Attachment[]; */

  /* @ApiProperty({
    type: "array",
    required: false,
    items: { $ref: getSchemaPath(Dataset) },
  })
  @Prop({
    type: [DatasetSchema],
    required: false,
  })
  datasets: Dataset[]; */

  @ApiProperty({
    type: MeasurementPeriod,
    description:
      "Embedded information used inside proposals to define which type of experiment as to be pursued where (at which intrument) and when.",
  })
  @Prop([MeasurementPeriodSchema])
  MeasurementPeriodList: MeasurementPeriod[];
}

export const ProposalSchema = SchemaFactory.createForClass(Proposal);

ProposalSchema.index({ "$**": "text" });
