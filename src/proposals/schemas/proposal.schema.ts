import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

import { OwnableClass } from "src/common/schemas/ownable.schema";
import {
  MeasurementPeriodClass,
  MeasurementPeriodSchema,
} from "./measurement-period.schema";

export type ProposalDocument = ProposalClass & Document;
@Schema({
  collection: "Proposal",
  toJSON: {
    getters: true,
  },
  timestamps: true,
})
export class ProposalClass extends OwnableClass {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Globally unique identifier of a proposal, eg. PID-prefix/internal-proposal-number. PID prefix is auto prepended.",
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  proposalId: string;

  @Prop({
    type: String,
  })
  _id: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Email of principal investigator.",
  })
  @Prop({
    type: String,
    required: false,
    index: true,
  })
  pi_email?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "First name of principal investigator.",
  })
  @Prop({
    type: String,
    required: false,
  })
  pi_firstname?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Last name of principal investigator.",
  })
  @Prop({
    type: String,
    required: false,
  })
  pi_lastname?: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Email of main proposer.",
  })
  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "First name of main proposer.",
  })
  @Prop({
    type: String,
    required: false,
  })
  firstname?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Last name of main proposer.",
  })
  @Prop({
    type: String,
    required: false,
  })
  lastname?: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "The title of the proposal.",
  })
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "The proposal abstract.",
  })
  @Prop({
    type: String,
    required: false,
  })
  abstract?: string;

  @ApiProperty({
    type: Date,
    required: false,
    description: "The date when the data collection starts.",
  })
  @Prop({
    type: Date,
    required: false,
  })
  startTime?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description: "The date when data collection finishes.",
  })
  @Prop({
    type: Date,
    required: false,
  })
  endTime?: Date;

  @ApiProperty({
    type: MeasurementPeriodClass,
    isArray: true,
    required: false,
    description:
      "Embedded information used inside proposals to define which type of experiment has to be pursued, where (at which instrument) and when.",
  })
  @Prop({
    type: [MeasurementPeriodSchema],
    required: false,
  })
  MeasurementPeriodList?: MeasurementPeriodClass[];

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
    description: "JSON object containing the proposal metadata.",
  })
  @Prop({ type: Object, required: false, default: {} })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "Parent proposal id",
    default: null,
    nullable: true,
  })
  @Prop({
    type: String,
    required: false,
    default: null,
    ref: "Proposal",
  })
  parentProposalId: string;
}

export const ProposalSchema = SchemaFactory.createForClass(ProposalClass);

ProposalSchema.index({ "$**": "text" });
