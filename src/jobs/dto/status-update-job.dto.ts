import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

@ApiTags("jobs")
export class UpdateStatusJobDto {
  @ApiProperty({
    type: String,
    required: true,
    description: "Updated job status code for the current status.",
  })
  @IsString()
  readonly statusCode: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "Additional message about the current job status.",
  })
  @IsString()
  @IsOptional()
  readonly statusMessage?: string;
}
