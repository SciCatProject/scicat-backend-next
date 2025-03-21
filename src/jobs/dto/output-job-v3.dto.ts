import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { DatasetListDto } from "./dataset-list.dto";

export class OutputJobV3Dto {
  @ApiHideProperty()
  _id: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Globally unique identifier of a job.",
  })
  id: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "The email of the person initiating the job request.",
  })
  emailJobInitiator?: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Type of job, e.g. archive, retrieve etc.",
  })
  type: string;

  @ApiProperty({
    type: Date,
    required: true,
    description:
      "Time when job is created. Format according to chapter 5.6 internet date/time format in RFC 3339. This is handled automatically by mongoose with timestamps flag.",
  })
  creationTime: Date;

  @ApiProperty({
    type: Date,
    required: false,
    description:
      "Time when job should be executed. If not specified then the Job will be executed asap. Format according to chapter 5.6 internet date/time format in RFC 3339.",
  })
  executionTime?: Date;

  @ApiProperty({
    type: Object,
    required: true,
    default: {},
    description:
      "Object of key-value pairs defining job input parameters, e.g. 'destinationPath' for retrieve jobs or 'tapeCopies' for archive jobs.",
  })
  jobParams: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "Defines current status of job lifecycle.",
  })
  jobStatusMessage?: string;

  @ApiProperty({
    type: [DatasetListDto],
    required: false,
    description:
      "Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected, or an explicit list of dataset-relative file paths, which should be selected.",
  })
  datasetList: DatasetListDto[];

  @ApiProperty({
    type: Object,
    required: true,
    default: {},
    description: "Detailed return value after job is finished.",
  })
  jobResultObject: Record<string, unknown>;
}
