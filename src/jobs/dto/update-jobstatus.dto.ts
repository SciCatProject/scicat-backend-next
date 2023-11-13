import { ApiProperty,  ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

@ApiTags("jobs")
export class UpdateJobStatusDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Id for the job to be updated.",
  })
  @IsString()
  readonly id: string;

  @ApiProperty({
    type: String,
    required: true,
    description:
      "Updated job status code for the current status.",
  })
  @IsString()
  readonly jobStatus: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Additional message about the current job status.",
  })
  @IsString()
  @IsOptional()
  readonly message?: string;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "JWT token for archiver service.",
  })
  @IsString()
  @IsOptional()
  readonly token?: string;
}