import { ApiTags, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { OwnableDto } from "../../common/dto/ownable.dto";
import { CreateMeasurementPeriodDto } from "./create-measurement-period.dto";

@ApiTags("proposals")
export class UpdateProposalDto extends OwnableDto {
  /**
   * Email of principal investigator.
   */
  @IsOptional()
  @IsEmail()
  readonly pi_email?: string;

  /**
   * First name of principal investigator.
   */
  @IsOptional()
  @IsString()
  readonly pi_firstname?: string;

  /**
   * Last name of principal investigator.
   */
  @IsOptional()
  @IsString()
  readonly pi_lastname?: string;

  /**
   * Email of main proposer.
   */
  @IsEmail()
  readonly email: string;

  /**
   * First name of main proposer.
   */
  @IsOptional()
  @IsString()
  readonly firstname?: string;

  /**
   * Last name of main proposer.
   */
  @IsOptional()
  @IsString()
  readonly lastname?: string;

  /**
   * The title of the proposal.
   */
  @IsString()
  readonly title: string;

  /**
   * The proposal abstract.
   */
  @IsOptional()
  @IsString()
  readonly abstract?: string;

  /**
   * The date when the data collection starts.
   */
  @IsOptional()
  @IsDateString()
  readonly startTime?: Date;

  /**
   * The date when data collection finishes.
   */
  @IsOptional()
  @IsDateString()
  readonly endTime?: Date;

  /**
   * Embedded information used inside proposals to define which type of experiment has to be pursued, where (at which instrument) and when.
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMeasurementPeriodDto)
  readonly MeasurementPeriodList?: CreateMeasurementPeriodDto[];

  /**
   * JSON object containing the proposal metadata.
   */
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;

  /**
   * Parent proposal id.
   */
  @IsOptional()
  @IsString()
  readonly parentProposalId?: string;

  /**
   * Characterize type of proposal, use some of the configured values
   */
  @IsOptional()
  @IsString()
  readonly type?: string;
}

export class PartialUpdateProposalDto extends PartialType(UpdateProposalDto) {}
