import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { OwnableClass } from "src/common/schemas/ownable.schema";

export type JobDocument = JobClass & Document;

@Schema({
  collection: "Job",
  minimize: false,
  timestamps: { createdAt: "DateTime", updatedAt: false },
  toJSON: {
    getters: true,
  },
})
export class JobClass extends OwnableClass {
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
    description:
      "Type of job as defined in the job configuration, e.g. archive, retrieve, etc",
    required: true,
  })
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  // status code
  @ApiProperty({
    type: String,
    required: false,
    description: "Defines the current status code of the job.",
  })
  @Prop({
    type: String,
    required: false,
  })
  statusCode: string;

  // update
  @ApiProperty({
    type: String,
    required: false,
    description:
      "stores the latest message received with the last status update for the job.",
  })
  @Prop({
    type: String,
    required: false,
  })
  statusMessage: string;

  // history of status codes
  @ApiProperty({
    type: [Object],
    required: false,
    description: "Array of status updates containing status code and message",
  })
  @Prop({
    type: [Object],
    required: false,
  })
  statusHistory: Record<string, string>[];

  // messages
  @ApiProperty({
    type: Object,
    required: false,
    description:
      "This is the equivalent object of the message sent to external service.",
  })
  @Prop({
    type: Object,
    required: false,
  })
  messageSent: Record<string, unknown>;

  // configuration definition (schema)
  @ApiProperty({
    type: Object,
    required: false,
    description:
      "This is the equivalent object of the job configuration used to create this job.",
  })
  @Prop({
    type: Object,
    required: false,
  })
  configuration: Record<string, unknown>;  // TBD

  // parameters (instance)
  @ApiProperty({
    type: Object,
    required: false,
    description:
      "This is the equivalent object of the jobs parameters provided by the user.",
  })
  @Prop({
    type: Object,
    required: false,
  })
  jobParams: Record<string, unknown>;
  // TODO email address for owner from scicat? see create example for job.recipients
  // in case email is needed it goes into params, and other values too
}
export const JobSchema = SchemaFactory.createForClass(JobClass);

JobSchema.index({ "$**": "text" });
