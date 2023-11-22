import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { JobType } from "../job-type.enum";
import { OwnableClass } from "src/common/schemas/ownable.schema";

export type JobDocument = JobClass & Document;

//{
//  * "id" : "7289ee0e-4739-11ee-bcae-0b150b8afb9e",
//  * "type" : "archive",
// ----
// taken care extending ownableClass
//  "created_by" : "user_1"
//  "created_at" : <timestamp>,
//  "updaded_at": <timestamp>,
//  "updated_by": “user_1”,
// ----
//  * "status_code" : "CREATED",
//  * "status_message": "Job created",
//  "updates_history" : [
//   {
//    "updaded_at": <timestamp>,
//    "updated_by": “user_1”,
//    "status_code" : "",
//    "statue_message" : ""
//   }
//  ],
//  "message_sent” : { <copy of the message posted see #7> },
//  "configuration" : {},
//  "params" : {}
//}


@Schema({
  collection: "Job",
  minimize: false, /* function? dataset schema has it*/
  timestamps: { createdAt: "DateTime", updatedAt: false },
  toJSON: {
    getters: true,
  },
})
export class JobClass extends OwnableClass{

  @ApiProperty({
    type: String,
    default: () => uuidv4(),
    description: "Globally unique identifier of a job.",
  })
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4(),
  })
  id: string;

  @Prop({
    type: String,
  })
  _id: string;

  // type
  @ApiProperty({
    type: String, 
    description: "Type of job as defined in the job configuration, e.g. archive, retrieve, etc",
    required: true
  })
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @ApiProperty({
    type: String,
    required: false, 
    description: "Defines the current status code of the job." 
  })
  @Prop({ 
    type: String, 
    required: false 
  })
  status_code: string;

  @ApiProperty({
    type: String,
    required: false, 
    description: "stores the latest message received with the last status update for the job." 
  })
  @Prop({ 
    type: String, 
    required: false 
  })
  status_message: string;

  @ApiProperty({
    type: [Object],
    required: false,
    description:
        "Array of status updates containing status code and message",
  })
  @Prop({ 
    type: [Object], 
    required: false 
  })
  status_history: Record<string, string>[];




  // email
  @ApiProperty({
    type: String,
    description: "The email of the person initiating the job request.",
  })
  @Prop({ type: string, required: false })
  emailJobInitiator: string;

  // action
  @ApiProperty({
    type: String, 
    description: "Type of job as defined in the job configuration, e.g. archive, retrieve, etc",
    required: true
  })
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  
  // removed execution time as this functionality is not foreseen for now
  // removed destinationPath as not forseen for this example
  // does the status of job lifecycle concern the update of a job lifecycle?

  /*
   * updateJob
   */

  @ApiProperty({ description: "Defines current status of job lifecycle." })
  @Prop({ type: string, required: false })
  jobStatusMessage: string;

  @ApiProperty({
  type: [String]
  description:
      "Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected or an explicit list of dataset-relative file paths, which should be selected.",
  })
  @Prop({ type: [Object], required: false })
  datasetList: Record<string, unknown>[];

  @ApiProperty({ description: "Detailed return value after job is finished." })
  @Prop({ type: Object, required: false })
  jobResultObject: Record<string, unknown>;

  /*
   * callback to user
   */


}
export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.index({ "$**": "text" });
