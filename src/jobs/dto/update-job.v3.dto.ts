import { IsDateString, IsObject, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class UpdateJobDtoV3 {
  /**
   * Time when job should be executed. If not specified then the Job will be executed asap. Format according to chapter 5.6 internet date/time format in RFC 3339.
   */
  @IsDateString()
  @IsOptional()
  readonly executionTime?: Date;

  /**
   * Job status message for the current status.
   */
  @IsString()
  readonly jobStatusMessage: string;

  /**
   * Additional information, i.e. dataset archiving results.
   */
  @IsObject()
  @IsOptional()
  readonly jobResultObject?: Record<string, unknown>;
}

export class PartialUpdateJobDtoV3 extends PartialType(UpdateJobDtoV3) {}
