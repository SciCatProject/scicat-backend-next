import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type JobDocument = Job & Document;

@Schema({
  collection: "Job",
})
export class Job {
  @Prop({ type: String, unique: true })
  _id: string;

  @Prop({ type: String, unique: true, default: () => uuidv4() })
  id: string;

  @ApiProperty({
    description: "The email of the person initiating the job request",
  })
  @Prop({ type: String, required: true })
  emailJobInitiator: string;

  @ApiProperty({ description: "Type of job, e.g. archive, retrieve etc" })
  @Prop({ type: String, required: true, default: "retrieve" })
  type: string;

  @ApiProperty({
    description:
      "Time when job is created. Format according to chapter 5.6 internet date/time format in RFC 3339",
  })
  @Prop({ type: Date, required: true, default: () => new Date() })
  creationTime: Date;

  @ApiProperty({
    description:
      "Time when job should be executed. If not specified then the Job will be executed asap. Format according to chapter 5.6 internet date/time format in RFC 3339",
  })
  @Prop({ type: Date, required: false })
  executionTime: Date;

  @ApiProperty({
    description:
      "Object of key-value pairs defining job input parameters, e.g. 'desinationPath' for retrieve jobs or 'tapeCopies' for archive jobs",
  })
  @Prop({ type: Object, required: false })
  jobParams: Record<string, unknown>;

  @ApiProperty({ description: "Defines current status of job lifecycle" })
  @Prop({ type: String, required: false })
  jobStatusMessage: string;

  @ApiProperty({
    description:
      "Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected or an explicit list of dataset-relative file paths, which should be selected",
  })
  @Prop({ type: Object, required: false })
  datasetList: Record<string, unknown>;

  @ApiProperty({ description: "Detailed return value after job is finished" })
  @Prop({ type: Object, required: false })
  jobResultObject: Record<string, unknown>;
}

export const JobSchema = SchemaFactory.createForClass(Job);
