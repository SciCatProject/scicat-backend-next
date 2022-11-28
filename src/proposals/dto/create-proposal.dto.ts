import { ApiProperty, ApiTags } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { OwnableDto } from "src/common/dto/ownable.dto";
import { Proposal } from "../schemas/proposal.schema";

@ApiTags("Proposal")
export class CreateProposalDto extends OwnableDto {
  @IsString()
  readonly proposalId: string;

  @IsOptional()
  @IsEmail()
  readonly pi_email?: string;

  @IsOptional()
  @IsString()
  readonly pi_firstname?: string;

  @IsOptional()
  @IsString()
  readonly pi_lastname?: string;

  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly firstname?: string;

  @IsOptional()
  @IsString()
  readonly lastname?: string;

  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly abstract?: string;

  @IsOptional()
  @IsDateString()
  readonly startTime?: Date;

  @IsOptional()
  @IsDateString()
  readonly endTime?: Date;

  @IsOptional()
  @ValidateNested()
  readonly MeasurementPeriodList?: Record<string, unknown>;
}
