import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsObject } from "class-validator";

export class OutputRuntimeConfigDto {
  @ApiProperty({
    type: String,
    description: "Unique config identifier (e.g. 'frontend', 'backend', etc.)",
    example: "frontend",
  })
  @IsString()
  _id: string;

  @ApiProperty({
    type: Object,
    description: "Configuration content as a JSON object",
  })
  @IsObject()
  data: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description: "Optional description of this configuration entry",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: String,
    description: "User or system that last updated the configuration",
    example: "system",
  })
  @IsString()
  updatedBy: string;
}
