import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import { OwnableClass } from "src/common/schemas/ownable.schema";
import { QueryableClass } from "src/common/schemas/queryable.schema";
import { v4 as uuidv4 } from "uuid";

export type MetadataKeyDocument = MetadataKeyClass & Document;

@Schema({
  collection: "MetadataKeys",
  minimize: false,
  timestamps: true,
  toJSON: {
    getters: true,
  },
})
export class MetadataKeyClass extends QueryableClass {
  @ApiProperty({
    type: String,
    required: true,
    default: function genUUID(): string {
      return (
        (process.env.PID_PREFIX
          ? process.env.PID_PREFIX.replace(/\/$/, "")
          : "undefined") +
        "/" +
        uuidv4()
      );
    },
    description:
      "Persistent Identifier for datasets derived from UUIDv4 and prepended automatically by site specific PID prefix like 20.500.12345/",
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: function genUUID(): string {
      return (
        (process.env.PID_PREFIX
          ? process.env.PID_PREFIX.replace(/\/$/, "")
          : "undefined") +
        "/" +
        uuidv4()
      );
    },
  })
  id: string;

  @Prop({
    type: String,
  })
  _id: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Metadata key.",
  })
  @Prop({
    type: String,
    required: true,
    index: true,
  })
  key: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Human readable name associated with the metadata key.",
  })
  @Prop({
    type: String,
    required: false,
  })
  humanReadableName?: string;

  @ApiProperty({
    type: [String],
    required: true,
    description: "List of user groups that can access this key.",
  })
  @Prop({
    type: String,
    required: true,
  })
  userGroups: string[];

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Type of item this key has been extracted from. Allowed values: Datasets, Proposals, Samples, Instruments.",
  })
  @Prop({
    type: String,
    required: true,
    index: true,
  })
  sourceType: string;
}

export const MetadataKeySchema = SchemaFactory.createForClass(MetadataKeyClass);

MetadataKeySchema.index({ "$**": "text" });
