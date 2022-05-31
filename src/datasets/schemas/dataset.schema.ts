import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Document } from "mongoose";
import {
  Attachment,
  AttachmentSchema,
} from "src/attachments/schemas/attachment.schema";
import { Ownable } from "src/common/schemas/ownable.schema";
import {
  Datablock,
  DatablockSchema,
} from "src/datablocks/schemas/datablock.schema";
import {
  OrigDatablock,
  OrigDatablockSchema,
} from "src/origdatablocks/schemas/origdatablock.schema";
import { v4 as uuidv4 } from "uuid";
import { DatasetType } from "../dataset-type.enum";
import { Lifecycle, LifecycleSchema } from "./lifecycle.schema";
import { Technique, TechniqueSchema } from "./technique.schema";

export type DatasetDocument = Dataset & Document;

@Schema({
  collection: "Dataset",
  discriminatorKey: "type",
  minimize: false,
  toJSON: {
    getters: true,
  },
})
export class Dataset extends Ownable {
  @ApiProperty({
    type: String,
    default: function genUUID(): string {
      return process.env.PID_PREFIX + uuidv4();
    },
    description:
      "Persistent Identifier for datasets derived from UUIDv4 and prepended automatically by site specific PID prefix like 20.500.12345/",
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

  @ApiProperty({
    type: String,
    description:
      "Owner or custodian of the data set, usually first name + lastname. The string may contain a list of persons, which should then be seperated by semicolons.",
  })
  @Prop({ type: String, required: true, index: true })
  owner: string;

  @ApiProperty({
    type: String,
    description:
      "Email of owner or of custodian of the data set. The string may contain a list of emails, which should then be seperated by semicolons.",
  })
  @Prop()
  ownerEmail: string;

  @ApiProperty({
    type: String,
    description:
      "ORCID of owner/custodian. The string may contain a list of ORCID, which should then be separated by semicolons.",
  })
  @Prop()
  orcidOfOwner: string;

  @ApiProperty({
    type: String,
    description:
      "Email of contact person for this dataset. The string may contain a list of emails, which should then be seperated by semicolons.",
  })
  @Prop({ type: String, required: true, index: true })
  contactEmail: string;

  @ApiProperty({
    type: String,
    description:
      "Absolute file path on file server containing the files of this dataset, e.g. /some/path/to/sourcefolder. In case of a single file dataset, e.g. HDF5 data, it contains the path up to, but excluding the filename. Trailing slashes are removed.",
  })
  @Prop({ type: String, required: true, index: true })
  sourceFolder: string;

  @ApiProperty({
    type: String,
    description:
      "DNS host name of file server hosting sourceFolder, optionally including protocol e.g. [protocol://]fileserver1.example.com",
  })
  @Prop({ type: String, index: true })
  sourceFolderHost: string;

  @ApiProperty({
    type: Number,
    description:
      "Total size of all source files contained in source folder on disk when unpacked",
  })
  @Prop({ type: Number, index: true })
  size: number;

  @ApiProperty({
    type: Number,
    description:
      "Total size of all datablock package files created for this dataset",
  })
  @Prop()
  packedSize: number;

  @ApiProperty({
    type: Number,
    description:
      "Total number of lines in filelisting of all OrigDatablocks for this dataset",
  })
  @Prop()
  numberOfFiles: number;

  @ApiProperty({
    type: Number,
    description:
      "Total number of lines in filelisting of all Datablocks for this dataset",
  })
  @Prop()
  numberOfFilesArchived: number;

  @ApiProperty({
    type: Date,
    description:
      "Time when dataset became fully available on disk, i.e. all containing files have been written. Format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.",
  })
  @Prop({ type: Date, required: true, index: true })
  creationTime: Date;

  @ApiProperty({
    type: String,
    description:
      "Characterize type of dataset, either 'base' or 'raw' or 'derived'. Autofilled when choosing the proper inherited models",
  })
  @Prop({
    type: String,
    required: true,
    enum: [DatasetType.Raw, DatasetType.Derived],
    index: true,
  })
  type: string;

  @ApiProperty({
    type: String,
    description:
      "Defines a level of trust, e.g. a measure of how much data was verified or used by other persons",
  })
  @Prop()
  validationStatus: string;

  @ApiProperty({
    type: [String],
    description:
      "Array of tags associated with the meaning or contents of this dataset. Values should ideally come from defined vocabularies, taxonomies, ontologies or knowledge graphs",
  })
  @Prop([String])
  keywords: string[];

  @ApiProperty({
    type: String,
    description: "Free text explanation of contents of dataset",
  })
  @Prop()
  description: string;

  @ApiProperty({
    type: String,
    description:
      "A name for the dataset, given by the creator to carry some semantic meaning. Useful for display purposes e.g. instead of displaying the pid. Will be autofilled if missing using info from sourceFolder",
  })
  @Prop()
  datasetName: string;

  @ApiProperty({
    type: String,
    description:
      "ACIA information about AUthenticity,COnfidentiality,INtegrity and AVailability requirements of dataset. E.g. AV(ailabilty)=medium could trigger the creation of a two tape copies. Format 'AV=medium,CO=low'",
  })
  @Prop()
  classification: string;

  @ApiProperty({
    type: String,
    description: "Name of license under which data can be used",
  })
  @Prop()
  license: string;

  @ApiProperty({
    type: String,
    description: "Version of API used in creation of dataset",
  })
  @Prop()
  version: string;

  @ApiProperty({
    type: Boolean,
    description: "Flag is true when data are made publically available",
  })
  @Prop({ default: false })
  isPublished: boolean;

  @ApiProperty({
    type: [Object],
    description: "List of objects containing old value and new value",
  })
  @Prop([Object])
  history: Record<string, unknown>[];

  @ApiProperty({
    type: Lifecycle,
    description:
      "For each dataset there exists an embedded dataset lifecycle document which describes the current status of the dataset during its lifetime with respect to the storage handling systems",
  })
  @Prop({ type: LifecycleSchema })
  datasetlifecycle: Lifecycle;

  @ApiProperty({ type: Date, description: "Date when dataset was created." })
  @Prop()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: "Date when the dataset was last modified.",
  })
  @Prop()
  updatedAt: Date;

  @ApiProperty({
    type: String,
    required: false,
    description: "ID of instrument where the data was created",
  })
  @Prop({ type: String, ref: "Instrument", required: false })
  instrumentId: string;

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(Technique) },
    description: "Stores the metadata information for techniques",
  })
  @Prop([TechniqueSchema])
  techniques: Technique[];

  @ApiProperty({
    type: [String],
    description: "List of users that the dataset has been shared with",
  })
  @Prop([String])
  sharedWith: string[];

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(Attachment) },
    description:
      "Small less than 16 MB attachments, envisaged for png/jpeg previews",
  })
  @Prop([AttachmentSchema])
  attachments: Attachment[];

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(OrigDatablock) },
    description:
      "Container list all files and their attributes which make up a dataset. Usually Filled at the time the datasets metadata is created in the data catalog. Can be used by subsequent archiving processes to create the archived datasets.",
  })
  @Prop([OrigDatablockSchema])
  origdatablocks: OrigDatablock[];

  @ApiProperty({
    type: "array",
    items: { $ref: getSchemaPath(Datablock) },
    description:
      "When archiving a dataset all files contained in the dataset are listed here together with their checksum information. Several datablocks can be created if the file listing is too long for a single datablock. This partitioning decision is done by the archiving system to allow for chunks of datablocks with managable sizes. E.g a dataset consisting of 10 TB of data could be split into 10 datablocks of about 1 TB each. The upper limit set by the data catalog system itself is given by the fact that documents must be smaller than 16 MB, which typically allows for datasets of about 100000 files.",
  })
  @Prop([DatablockSchema])
  datablocks: Datablock[];
}

export const DatasetSchema = SchemaFactory.createForClass(Dataset);

DatasetSchema.index({ "$**": "text" });
