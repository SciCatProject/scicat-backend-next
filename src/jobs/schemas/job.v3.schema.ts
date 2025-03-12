import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { DatasetListDto } from "../dto/dataset-list.dto";

export type JobDocumentV3 = JobClassV3 & Document;

@Schema({
  collection: "Job",
  timestamps: false,
  toJSON: {
    getters: true,
  },
})
export class JobClassV3 {
  @ApiProperty({
    type: String,
    required: true,
    description: "Globally unique identifier of a job.",
  })
  @Prop({
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  })
  id: string;

  @Prop({
    type: String,
  })
  _id: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "The email of the person initiating the job request.",
  })
  @Prop({
    type: String,
    required: false,
  })
  emailJobInitiator: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Type of job, e.g. archive, retrieve etc",
  })
  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @ApiProperty({
    type: Date,
    required: true,
    description:
      "Time when job is created. Format according to chapter 5.6 internet date/time format in RFC 3339. This is handled automatically by mongoose with timestamps flag.",
  })
  @Prop({
    type: Date,
    required: true,
  })
  creationTime: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description:
      "Time when job should be executed. If not specified then the Job will be executed asap. Format according to chapter 5.6 internet date/time format in RFC 3339.",
  })
  @Prop({
    type: Date,
    required: false,
  })
  executionTime: Date;

  @ApiProperty({
    type: Object,
    required: true,
    description:
      "Object of key-value pairs defining job input parameters, e.g. 'destinationPath' for retrieve jobs or 'tapeCopies' for archive jobs.",
  })
  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  jobParams: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "Defines current status of job lifecycle.",
  })
  @Prop({
    type: String,
    required: false,
  })
  jobStatusMessage: string;

  @ApiProperty({
    type: DatasetListDto,
    isArray: true,
    required: false,
    description:
      "Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected or an explicit list of dataset-relative file paths, which should be selected.",
  })
  @Prop({
    type: [DatasetListDto],
    required: false,
  })
  datasetList: DatasetListDto[];

  @ApiProperty({
    type: Object,
    required: true,
    description: "Detailed return value after job is finished.",
  })
  @Prop({
    type: Object,
    required: true,
    default: {},
  })
  jobResultObject: Record<string, unknown>;
}

export const JobSchema = SchemaFactory.createForClass(JobClassV3);

JobSchema.index({ "$**": "text" });
