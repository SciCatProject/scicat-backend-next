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

  @ApiProperty({
    type: String,
    description: "Defines the user that owns this job",
  })
  @Prop({
    type: String,
    index: true,
  })
  ownerUser: string;

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

  // status message
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

  // dataset validation results
  @ApiProperty({
    type: Boolean,
    required: true,
    description:
      "True if the user has the access requested to all the datasets listed on this job",
  })
  @Prop({
    type: Boolean,
    required: true,
  })
  datasetsValidation: boolean;

  @ApiProperty({
    type: String,
    required: false,
    default: "",
    description:
      "Email of the person to contact regarding this job. If the job is submitted anonymously, an email has to be provided",
  })
  @Prop({
    type: String,
    required: false,
  })
  contactEmail: string;

  @ApiProperty({
    type: Object,
    description: "Configuration version that was used to create this job.",
    required: true,
  })
  @Prop({
    type: Object,
    required: true,
  })
  configVersion: string;

  // initially empty, then provided during statusUpdate
  @ApiProperty({
    type: Object,
    required: false,
    description: "Contains the dataset archiving results.",
  })
  @Prop({
    type: Object,
    required: false,
  })
  jobResultObject: Record<string, unknown>;
}
export const JobSchema = SchemaFactory.createForClass(JobClass);

JobSchema.index({ "$**": "text" });
