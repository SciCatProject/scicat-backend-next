import { ApiTags } from "@nestjs/swagger";
import { IsEmail, IsObject, IsOptional, IsString } from "class-validator";

@ApiTags("jobs")
export class CreateJobDto {
  /**
   * Valid job type as defined in configuration.
   */
  @IsString()
  readonly type: string;

  /**
   * Job's parameters as defined by job template in configuration.
   */
  @IsObject()
  readonly jobParams: Record<string, unknown>;

  /**
   * User that this job belongs to. Applicable only if requesting user has adequate permissions level.
   */
  @IsString()
  @IsOptional()
  readonly ownerUser?: string;

  /**
   * Group that this job belongs to. Applicable only if requesting user has adequate permissions level.
   */
  @IsString()
  @IsOptional()
  readonly ownerGroup?: string;

  /**
   * Email to contact regarding this job. If the job is submitted anonymously, an email has to be provided.
   */
  @IsEmail()
  @IsOptional()
  readonly contactEmail?: string;
}
