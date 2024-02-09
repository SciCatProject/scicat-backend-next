import { IsDateString, IsObject, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class UpdateJobDto {
  @IsDateString()
  @IsOptional()
  readonly executionTime?: Date;

  @IsString()
  @IsOptional()
  readonly jobStatusMessage?: string;

  @IsObject()
  @IsOptional()
  readonly jobResultObject?: Record<string, unknown>;
}

export class PartialUpdateJobDto extends PartialType(UpdateJobDto) {}
