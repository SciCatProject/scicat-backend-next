import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import { Ownable } from "src/common/schemas/ownable.schema";
import { v4 as uuidv4 } from "uuid";
import { Lifecycle, LifecycleSchema } from "./lifecycle.schema";
import { Technique, TechniqueSchema } from "./technique.schema";

export enum DatasetType {
  Raw = "raw",
  Derived = "derived",
}

export type DatasetDocument = Dataset & Document;

@Schema({
  collection: "Dataset",
  discriminatorKey: "type",
  emitIndexErrors: true,
})
export class Dataset extends Ownable {
  @ApiProperty({
    type: String,
    default: function genUUID(): string {
      return process.env.PID_PREFIX + uuidv4();
    },
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: function genUUID(): string {
      return process.env.PID_PREFIX + uuidv4();
    },
  })
  pid: string;

  @Prop({
    type: String,
    unique: true,
  })
  _id: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  owner: string;

  @ApiProperty()
  @Prop()
  ownerEmail: string;

  @ApiProperty()
  @Prop()
  orcidOfOwner: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  contactEmail: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  sourceFolder: string;

  @ApiProperty()
  @Prop({ type: String, index: true })
  sourceFolderHost: string;

  @ApiProperty()
  @Prop({ type: Number, index: true })
  size: number;

  @ApiProperty()
  @Prop()
  packedSize: number;

  @ApiProperty()
  @Prop()
  numberOfFiles: number;

  @ApiProperty()
  @Prop()
  numberOfFilesArchived: number;

  @ApiProperty()
  @Prop({ type: Date, required: true, index: true })
  creationTime: Date;

  @ApiProperty()
  @Prop({
    type: String,
    required: true,
    enum: [DatasetType.Raw, DatasetType.Derived],
    index: true,
  })
  type: string;

  @ApiProperty()
  @Prop()
  validationStatus: string;

  @ApiProperty()
  @Prop([String])
  keywords: string[];

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop()
  datasetName: string;

  @ApiProperty()
  @Prop()
  classification: string;

  @ApiProperty()
  @Prop()
  license: string;

  @ApiProperty()
  @Prop()
  version: string;

  @ApiProperty()
  @Prop({ default: false })
  isPublished: boolean;

  @ApiProperty()
  @Prop([Object])
  history: Record<string, unknown>[];

  @ApiProperty({ type: Lifecycle })
  @Prop({ type: LifecycleSchema })
  datasetlifecycle: Lifecycle;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;

  @ApiProperty()
  @Prop()
  instrumentId: string;

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(Technique) },
  })
  @Prop([TechniqueSchema])
  techniques: Technique[];

  @ApiProperty()
  @Prop([String])
  sharedWith: string[];
}

export const DatasetSchema = SchemaFactory.createForClass(Dataset);

// DatasetSchema.virtual("pid")
//   .get(function () {
//     return this._id;
//   })
//   .set(function (value: string) {
//     this._id = value;
//   });
// DatasetSchema.set("toJSON", {
//   virtuals: true,
// });

DatasetSchema.index({ "$**": "text" });
