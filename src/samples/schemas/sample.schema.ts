import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { OwnableClass } from "src/common/schemas/ownable.schema";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { v4 as uuidv4 } from "uuid";

export type SampleDocument = SampleClass & Document;

@Schema({
  collection: "Sample",
  toJSON: {
    getters: true,
  },
  timestamps: true,
})
export class SampleClass extends OwnableClass {
  @Prop({ type: String })
  _id: string;

  @ApiProperty({
    type: String,
    default: () => uuidv4(),
    required: true,
    description:
      "Globally unique identifier of a sample. This could be provided as an input value or generated by the system.",
  })
  @Prop({ type: String, unique: true, required: true, default: () => uuidv4() })
  sampleId: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "The owner of the sample.",
  })
  @Prop({ type: String, required: false })
  owner?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "A description of the sample.",
  })
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({
    type: Object,
    default: {},
    required: false,
    description: "JSON object containing the sample characteristics metadata.",
  })
  @Prop({ type: Object, required: false, default: {} })
  sampleCharacteristics?: Record<string, unknown>;

  @ApiProperty({
    type: Boolean,
    default: false,
    required: false,
    description: "Flag is true when data are made publicly available.",
  })
  @Prop({ type: Boolean, required: false, default: false })
  isPublished?: boolean;
}

export class SampleWithAttachmentsAndDatasets extends SampleClass {
  /*
  @ApiProperty({ type: "array", items: { $ref: getSchemaPath(Attachment) } })
  @Prop([AttachmentSchema])*/
  // this property should not be present in the database model
  @ApiProperty({
    type: Attachment,
    isArray: true,
    required: false,
    description: "Attachments that are related to this sample.",
  })
  attachments?: Attachment[];

  /*
  @ApiProperty({ type: "array", items: { $ref: getSchemaPath(Dataset) } })
  @Prop([DatasetSchema])*/
  // this property should not be present in the database model
  @ApiProperty({
    type: DatasetClass,
    isArray: true,
    required: false,
    description: "Datasets that are related to this sample.",
  })
  datasets?: DatasetClass[];
}

export const SampleSchema = SchemaFactory.createForClass(SampleClass);

SampleSchema.index({ "$**": "text" });
