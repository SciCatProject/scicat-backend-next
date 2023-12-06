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

}
