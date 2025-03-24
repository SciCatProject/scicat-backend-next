import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from "@nestjs/swagger";
import { Document } from "mongoose";
import { OwnableClass } from "src/common/schemas/ownable.schema";
import { v4 as uuidv4 } from "uuid";
import {
  AttachmentRelationshipClass,
  AttachmentRelationshipSchema,
} from "./relationship.schema";

export type AttachmentDocument = Attachment & Document;

@Schema({
  collection: "Attachment",
  toJSON: {
    getters: true,
  },
  timestamps: true,
})
export class Attachment extends OwnableClass {
  @ApiProperty({ type: String, default: () => uuidv4() })
  @Prop({
    type: String,
    default: () => uuidv4(),
    sparse: true,
  })
  aid: string;

  @Prop({
    type: String,
  })
  _id: string;

  @ApiProperty({
    type: String,
    description:
      "A small, base64-encoded image. Must have a MIME content-header; e.g. 'data:image/png;base64,{the-image-in-base64}'.",
  })
  @Prop({ type: String })
  thumbnail: string;

  @ApiProperty({
    type: String,
    description: "Attachment caption to show in frontend.",
  })
  @Prop({ type: String })
  caption: string;

  @ApiPropertyOptional({
    type: Array,
    items: { $ref: getSchemaPath(AttachmentRelationshipClass) },
    default: [],
    description:
      "Array of relationships with other entities. It contains relationship type, target ids and target entity type.",
  })
  @Prop({ type: [AttachmentRelationshipSchema], default: [] })
  relationships?: AttachmentRelationshipClass[];
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
