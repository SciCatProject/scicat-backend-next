import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type LifecycleDocument = Lifecycle & Document;

@Schema()
export class Lifecycle {
  @Prop({ required: false })
  id?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      "Flag which is true, if dataset is available to be archived and no archive job for this dataset exists yet.",
  })
  @Prop({ default: true, required: false, index: true })
  archivable?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      "Flag which is true, if dataset is stored on archive system and is ready to be retrieved.",
  })
  @Prop({ default: false, required: false, index: true })
  retrievable?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      "Flag which is true, if dataset can be published. Usually requires a longterm storage option on tape or similar.",
  })
  @Prop({ default: false, required: false, index: true })
  publishable?: boolean;

  @ApiProperty({
    type: Date,
    required: false,
    description:
      "Day when dataset will be removed from disk, assuming that is already stored on tape.",
  })
  @Prop({ type: Date, default: Date.now(), required: false })
  dateOfDiskPurging?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description:
      "Day when the dataset's future fate will be evaluated again, e.g. to decide if the dataset can be deleted from archive.",
  })
  @Prop({
    type: Date,
    default: function retentionTime() {
      const now = new Date();
      return new Date(
        now.getFullYear() + Number(process.env.POLICY_RETENTION_SHIFT || 0),
        now.getMonth(),
        now.getDay(),
      );
    },
    required: false,
  })
  archiveRetentionTime?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description:
      "Day when dataset is supposed to become public according to data policy",
  })
  @Prop({
    type: Date,
    default: function publishingDate() {
      const now = new Date();
      return new Date(
        now.getFullYear() + Number(process.env.POLICY_PUBLICATION_SHIFT || 0),
        now.getMonth(),
        now.getDay(),
      );
    },
    required: false,
  })
  dateOfPublishing?: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description: "Day when dataset was published.",
  })
  @Prop({ type: Date, default: Date.now(), required: false })
  publishedOn?: Date;

  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      "Flag which is true, if full dataset is available on central fileserver. If false data needs to be copied from decentral storage place to  a cache server before the ingest. This information needs to be transferred to the archive system at archive time",
  })
  @Prop({ default: true, required: false })
  isOnCentralDisk?: boolean;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Short string defining current status of Dataset with respect to storage on disk/tape.",
  })
  @Prop({ default: "datasetCreated", required: false, index: true })
  archiveStatusMessage?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Latest message for this dataset concerning retrieve from archive system.",
  })
  @Prop({ required: false, index: true, default: "" })
  retrieveStatusMessage?: string;

  @ApiProperty({
    type: Object,
    required: false,
    description:
      "Detailed status or error message returned by archive system when archiving this dataset.",
  })
  @Prop({ type: Object, required: false })
  archiveReturnMessage?: unknown;

  @ApiProperty({
    type: Object,
    required: false,
    description:
      "Detailed status or error message returned by archive system when retrieving this dataset.",
  })
  @Prop({ type: Object, required: false })
  retrieveReturnMessage?: unknown;

  @ApiProperty({
    type: String,
    required: false,
    description: "Location of the last export destination.",
  })
  @Prop({ required: false })
  exportedTo?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      "Set to true when checksum tests after retrieve of datasets were successful",
  })
  @Prop({ default: false, required: false })
  retrieveIntegrityCheck?: boolean;
}

export const LifecycleSchema = SchemaFactory.createForClass(Lifecycle);
