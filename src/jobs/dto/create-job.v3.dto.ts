import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { DatasetListDto } from "./dataset-list.dto";
import { UpdateJobDtoV3 } from "./update-job.v3.dto";

export class CreateJobDtoV3 extends UpdateJobDtoV3 {
  /**
   * Email to contact regarding this job.
   */
  @IsEmail()
  @IsOptional()
  readonly emailJobInitiator?: string;

  /**
   * Valid job type as defined in configuration.
   */
  @IsString()
  readonly type: string;

  /**
   * Job's parameters as defined by job template in configuration.
   */
  @IsObject()
  @IsOptional()
  readonly jobParams?: Record<string, unknown>;

  /**
   * Array of objects with keys: pid, files. The value for the pid key defines the dataset ID, the value for the files key is an array of file names. This array is either an empty array, implying that all files within the dataset are selected, or an explicit list of dataset-relative file paths, which should be selected.
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DatasetListDto)
  readonly datasetList: DatasetListDto[];
}
