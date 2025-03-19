import { ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString, IsObject } from "class-validator";

@ApiTags("jobs")
export class UpdateJobDto {
  /**
   * Updated job status code for the current status.
   */
  @IsString()
  readonly statusCode: string;

  /**
   * Additional message about the current job status.
   */
  @IsString()
  readonly statusMessage: string;

  /**
   * Additional information, i.e. dataset archiving results.
   */
  @IsObject()
  @IsOptional()
  readonly jobResultObject?: Record<string, unknown>;
}
