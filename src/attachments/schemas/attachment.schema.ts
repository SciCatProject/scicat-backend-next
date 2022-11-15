import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { string } from "mathjs";
import { Document } from "mongoose";
import { Ownable } from "src/common/schemas/ownable.schema";
import { v4 as uuidv4 } from "uuid";

export type AttachmentDocument = Attachment & Document;

@Schema({
  collection: "Attachment",
  toJSON: {
    getters: true,
  },
})
export class Attachment extends Ownable {
  @ApiProperty({ type: String, default: () => uuidv4() })
  @Prop({
    type: String,
    default: () => uuidv4(),
    sparse: true,
  })
  id: string;

  @Prop({
    type: String,
  })
  _id: string;

  @ApiProperty({
    type: String,
    description:
      "Contains a thumbnail preview in base64 encoded png format for a given dataset",
  })
  @Prop({ type: String })
  thumbnail: string;

  @ApiProperty({
    type: String,
    description: "Attachment caption to show in frontend",
  })
  @Prop({ type: String })
  caption: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ type: String, ref: "Dataset", required: false })
  datasetId: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ type: String, ref: "Proposal", required: false })
  proposalId: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ type: String, ref: "Sample", required: false })
  sampleId: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
