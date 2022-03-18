import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import {
  Attachment,
  AttachmentSchema,
} from "src/attachments/schemas/attachment.schema";
import { Ownable } from "src/common/schemas/ownable.schema";
import { Dataset, DatasetSchema } from "src/datasets/schemas/dataset.schema";
import { v4 as uuidv4 } from "uuid";

export type SampleDocument = Sample & Document;

@Schema({
  collection: "Sample",
})
export class Sample extends Ownable {
  @Prop({ type: String, unique: true })
  _id: string;

  @ApiProperty({
    type: String,
    default: () => uuidv4(),
  })
  @Prop({ type: String, unique: true, default: () => uuidv4() })
  sampleId: string;

  @ApiProperty({ type: String, description: "The owner of the sample" })
  @Prop()
  owner: string;

  @ApiProperty({ type: String, description: "A description of the sample" })
  @Prop()
  description: string;

  @ApiProperty({ type: Date, description: "Date when the sample was created" })
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: "Date when the sample was last modified",
  })
  @Prop({ type: Date })
  updatedAt: Date;

  @ApiProperty({
    type: Object,
    default: {},
    description: "JSON object containing the sample characteristics metadata",
  })
  @Prop({ type: Object, default: {} })
  sampleCharacteristics: Record<string, unknown>;

  @ApiProperty({
    type: Boolean,
    default: false,
    description: "Flag is true when data are made publically available",
  })
  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @ApiProperty({ type: "array", items: { $ref: getSchemaPath(Attachment) } })
  @Prop([AttachmentSchema])
  attachments: Attachment[];

  @ApiProperty({ type: "array", items: { $ref: getSchemaPath(Dataset) } })
  @Prop([DatasetSchema])
  datasets: Dataset[];
}

export const SampleSchema = SchemaFactory.createForClass(Sample);

SampleSchema.index({ "$**": "text" });
