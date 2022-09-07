import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreateProposalDto extends OwnableDto {
  //@ApiProperty()
  @IsString()
  readonly proposalId: string;

  //@ApiProperty()
  @IsOptional()
  @IsEmail()
  readonly pi_email: string;

  //@ApiProperty()
  @IsOptional()
  @IsString()
  readonly pi_firstname: string;

  //@ApiProperty()
  @IsOptional()
  @IsString()
  readonly pi_lastname: string;

  //@ApiProperty()
  @IsEmail()
  readonly email: string;

  //@ApiProperty()
  @IsOptional()
  @IsString()
  readonly firstname: string;

  //@ApiProperty()
  @IsOptional()
  @IsString()
  readonly lastname: string;

  //@ApiProperty()
  @IsString()
  readonly title: string;

  //@ApiProperty()
  @IsOptional()
  @IsString()
  readonly abstract: string;

  //@ApiProperty()
  @IsOptional()
  @IsDateString()
  readonly startTime?: Date;

  //@ApiProperty()
  @IsOptional()
  @IsDateString()
  readonly endTime?: Date;

  //@ApiProperty({ type: Object })
  @IsOptional()
  @ValidateNested()
  readonly MeasurementPeriodList?: Record<string, unknown>;
}
