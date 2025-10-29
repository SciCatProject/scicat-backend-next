import { ApiHideProperty } from "@nestjs/swagger";
import { DatasetListDto } from "./dataset-list.dto";
import { Expose, Transform } from "class-transformer";
import _ from "lodash";
import { jobV3toV4FieldMap } from "../types/jobs-filter-content";
import { JobClass } from "../schemas/job.schema";

const mapJobV3toV4Field = (
  jobClass: JobClass,
  key: keyof JobClass | keyof OutputJobV3Dto | string,
): OutputJobV3Dto[keyof OutputJobV3Dto] | JobClass[keyof JobClass] | null => {
  if (!jobClass) return null;
  return (
    jobClass[key as keyof JobClass] ?? _.get(jobClass, jobV3toV4FieldMap[key])
  );
};

export class OutputJobV3Dto {
  @ApiHideProperty()
  @Expose()
  _id: string;

  /**
   * Globally unique identifier of a job.
   */
  @Expose()
  id: string;

  /**
   * The email of the person initiating the job request.
   */
  @Expose()
  @Transform(({ obj, key }) => mapJobV3toV4Field(obj, key))
  emailJobInitiator?: string;

  /**
   * Type of job, e.g. archive, retrieve etc.
   */
  @Expose()
  type: string;

  /**
   * Time when job is created. Format according to chapter 5.6 internet date/time format in RFC 3339. This is handled automatically by mongoose with timestamps flag.
   */
  @Expose()
  @Transform(({ obj, key }) => mapJobV3toV4Field(obj, key))
  creationTime: Date;

  /**
   * Time when job should be executed. If not specified then the Job will be executed asap. Format according to chapter 5.6 internet date/time format in RFC 3339.
   */
  @Expose()
  @Transform(({ obj, key }) => mapJobV3toV4Field(obj, key))
  executionTime?: Date;

  /**
   * Object of key-value pairs defining job input parameters, e.g. 'destinationPath' for retrieve jobs or 'tapeCopies' for archive jobs.
   */
  @Expose()
  @Transform(({ obj }) => {
    return {
      username: _.get(obj, jobV3toV4FieldMap["jobParams.username"]),
      ..._.omit(obj?.jobParams, "datasetList"),
    };
  })
  jobParams: Record<string, unknown>;

  /**
   * Defines current status of job lifecycle.
   */
  @Expose()
  @Transform(({ obj, key }) => mapJobV3toV4Field(obj, key))
  jobStatusMessage?: string;

  /**
   * Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected, or an explicit list of dataset-relative file paths, which should be selected.
   */
  @Expose()
  @Transform(({ obj, key }) => mapJobV3toV4Field(obj, key))
  datasetList: DatasetListDto[];

  /**
   * Detailed return value after job is finished.
   */
  @Expose()
  jobResultObject: Record<string, unknown>;
}
