import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsObject } from "class-validator";

export class OutputRuntimeConfigDto {
  @ApiProperty({
    type: String,
    description: "Unique config identifier (e.g. 'frontend', 'backend', etc.)",
    example: "frontend",
  })
  @IsString()
  cid: string;

  @ApiProperty({
    type: Object,
    description: "Configuration content as a JSON object",
  })
  @IsObject()
  data: Record<string, unknown>;

  @ApiProperty({
    type: String,
    description: "User or system that last updated the configuration",
    example: "system",
  })
  @IsString()
  updatedBy: string;
}
