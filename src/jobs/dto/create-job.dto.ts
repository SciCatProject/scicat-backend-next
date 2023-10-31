import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiTags } from "@nestjs/swagger";

@ApiTags("jobs")
export class CreateJobDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Valid job type as defined in configuration.",
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    type: Object,
    required: true,
    description:
      "Job's parameters as defined by job template in configuration",
  })
  @IsObject()
  readonly jobParams: Record<string, unknown>;

  /*
  New stuff from here
  */
  // Do we want to let users provide/resrve job-ids on creation?
  @ApiProperty({
    type: String,
    required: false,
    description:
      "Id for the job to be crated.",
  })
  @IsOptional()
  @IsString()
  readonly id?: string;

  @ApiProperty({
    type: [String],
    required: false,
    default: [],
    description:
      "Array of existing job ids which need to finish before this job can run.",
  })
  @IsOptional()
  @IsString({ each: true })
  readonly dependsOn?: string[];

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Email of the contact person for this job.",
  })
  @IsOptional()
  @IsEmail()
  readonly contactEmail?: string;
}
