import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsEmail, IsObject, IsOptional, IsString } from "class-validator";

@ApiTags("jobs")
export class CreateJobDto {
  @ApiProperty({
    type: String,
    required: true,
    description: "Valid job type as defined in configuration.",
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    type: Object,
    required: true,
    description: "Job's parameters as defined by job template in configuration",
  })
  @IsObject()
  readonly jobParams: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "User that this job belongs to. Applicable only if requesting user has dequate permissions level"
  })
  @IsString()
  @IsOptional()
  readonly ownerUser: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Group that this job belongs to. Applicable only if requesting user has dequate permissions level"
  })
  @IsString()
  @IsOptional()
  readonly ownerGroup: string;

  @ApiProperty({
    type: String,
    required: false,
    default: "",
    description: "Email to contact regarding this job. If the job is submitted anonymously, an email has to be provided"
  })
  @IsEmail()
  @IsOptional()
  readonly contactEmail: string;
}
