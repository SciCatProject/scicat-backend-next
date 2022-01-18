import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import {
  Attachment,
  AttachmentSchema,
} from "src/attachments/schemas/attachment.schema";
import { Ownable } from "src/common/schemas/ownable.schema";
import {
  MeasurementPeriod,
  MeasurementPeriodSchema,
} from "./measurement-peroid.schema";

export type ProposalDocument = Proposal & Document;
@Schema({
  collection: "Proposal",
})
export class Proposal extends Ownable {
  @ApiProperty()
  @Prop({ type: String, unique: true, required: true })
  proposalId: string;

  @Prop({ type: String, unique: true })
  _id: string;

  @ApiProperty()
  @Prop({ type: String, index: true })
  pi_email: string;

  @ApiProperty()
  @Prop()
  pi_firstname: string;

  @ApiProperty()
  @Prop()
  pi_lastname: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  email: string;

  @ApiProperty()
  @Prop()
  firstname: string;

  @ApiProperty()
  @Prop()
  lastname: string;

  @ApiProperty()
  @Prop()
  title: string;

  @ApiProperty()
  @Prop()
  abstract: string;

  @ApiProperty()
  @Prop({ type: Date })
  startTime: Date;

  @ApiProperty()
  @Prop({ type: Date })
  endTime: Date;

  @ApiProperty({ type: "array", items: { $ref: getSchemaPath(Attachment) } })
  @Prop([AttachmentSchema])
  attachments: Attachment[];

  @ApiProperty({ type: MeasurementPeriod })
  @Prop({ type: MeasurementPeriodSchema })
  MeasurementPeriodList: MeasurementPeriod[];
}

export const ProposalSchema = SchemaFactory.createForClass(Proposal);
