import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

@ApiTags("jobs")
export class UpdateJobStatusDto {
  @ApiProperty({
    type: String,
    required: true,
    description: "Updated job status message for the current status.",
  })
  @IsString()
  readonly jobStatusMessage: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Updated job status code for the current status.",
  })
  @IsString()
  readonly jobStatusCode: string;

  // TBD are 'message' and 'token' needed?
  @ApiProperty({
    type: String,
    required: false,
    description: "Additional message about the current job status.",
  })
  @IsString()
  @IsOptional()
  readonly message?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "JWT token for archiver service.",
  })
  @IsString()
  @IsOptional()
  readonly token?: string;
}
