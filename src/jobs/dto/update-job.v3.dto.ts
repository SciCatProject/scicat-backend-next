import { IsDateString, IsObject, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class UpdateJobDtoV3 {
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

export class PartialUpdateJobDtoV3 extends PartialType(UpdateJobDtoV3) {}
