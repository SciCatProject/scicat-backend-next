import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateMeasurementPeriodDto {
  @IsString()
  readonly instrument: string;

  @IsDateString()
  readonly start: Date;

  @IsDateString()
  readonly end: Date;

  @IsOptional()
  @IsString()
  readonly comment?: string;
}
