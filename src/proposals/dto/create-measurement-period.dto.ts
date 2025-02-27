import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateMeasurementPeriodDto {
  /**
   * Instrument or beamline identifier where measurement was pursued, e.g. /PSI/SLS/TOMCAT
   */
  @IsString()
  readonly instrument: string;

  /**
   * Time when measurement period started, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.
   */
  @IsDateString()
  readonly start: Date;

  /**
   * Time when measurement period ended, format according to chapter 5.6 internet date/time format in RFC 3339. Local times without timezone/offset info are automatically transformed to UTC using the timezone of the API server.
   */
  @IsDateString()
  readonly end: Date;

  /**
   * Additional information relevant for this measurement period, e.g. if different accounts were used for data taking.
   */
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
