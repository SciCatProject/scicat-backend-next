import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { JobType } from "../job-type.enum";

export type JobDocument = Job & Document;

{
  "id" : "7289ee0e-4739-11ee-bcae-0b150b8afb9e",
  "type" : "archive",
  "created_by" : "user_1"
  "created_at" : <timestamp>,
  "status_code" : "CREATED",
  "updaded_at": <timestamp>,
  "updated_by": “user_1”,
  "status_message": "Job created",
  "updates_history" : [
   {
    "updaded_at": <timestamp>,
    "updated_by": “user_1”,
    "status_code" : "",
    "statue_message" : ""
   }
  ],
  "message_sent” : { <copy of the message posted see #7> },
  "configuration" : {},
  "params" : {}
}

@Schema({
  collection: "Job",
  timestamps: { createdAt: "creationTime", updatedAt: false },
  toJSON: {
    getters: true,
  },
})
export class Job {
  @ApiProperty({
    type: String,
    description: "Globally unique identifier of a job.",
    readOnly: true,
  })
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  id?: string;

  @ApiProperty({
    description: "The email of the person initiating the job request.",
  })
  @Prop({ type: String, required: true })
  emailJobInitiator: string;

  @ApiProperty({
    type: String, 
    description: "Type of job as defined in the job configuration, e.g. archive, retrieve etc",
    required: true
  })
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @ApiProperty({
    description:
      "Time when job is created. Format according to chapter 5.6 internet date/time format in RFC 3339. This is handled automatically by mongoose with timestamps flag.",
  })
  @Prop({ type: Date })
  creationTime: Date;

  @ApiProperty({
    description:
      "Time when job should be executed. If not specified then the Job will be executed asap. Format according to chapter 5.6 internet date/time format in RFC 3339.",
  })
  @Prop({ type: Date, required: false })
  executionTime: Date;

  @ApiProperty({
    description:
      "Object of key-value pairs defining job input parameters, e.g. 'destinationPath' for retrieve jobs or 'tapeCopies' for archive jobs.",
  })
  @Prop({ type: Object, required: false })
  jobParams: Record<string, unknown>;

  @ApiProperty({ description: "Defines current status of job lifecycle." })
  @Prop({ type: String, required: false })
  jobStatusMessage: string;

  @ApiProperty({
    description:
      "Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected or an explicit list of dataset-relative file paths, which should be selected.",
  })
  @Prop({ type: [Object], required: false })
  datasetList: Record<string, unknown>[];

  @ApiProperty({ description: "Detailed return value after job is finished." })
  @Prop({ type: Object, required: false })
  jobResultObject: Record<string, unknown>;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.index({ "$**": "text" });
