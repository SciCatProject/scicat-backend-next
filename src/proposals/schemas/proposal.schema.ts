import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { Ownable } from "src/common/schemas/ownable.schema";

export type ProposalDocument = Proposal & Document;
@Schema({
  collection: "Proposal",
})
export class Proposal extends Ownable {
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
}

export const ProposalSchema = SchemaFactory.createForClass(Proposal);
