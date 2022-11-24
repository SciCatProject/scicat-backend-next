import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreatePolicyDto extends OwnableDto {
  @IsArray()
  @IsOptional()
  readonly manager: string[];

  @IsString()
  @IsOptional()
  readonly tapeRedundancy: string;

  @IsBoolean()
  @IsOptional()
  readonly autoArchive: boolean;

  @IsNumber()
  @IsOptional()
  readonly autoArchiveDelay: number;

  @IsBoolean()
  @IsOptional()
  readonly archiveEmailNotification: boolean;

  @IsArray()
  @IsOptional()
  readonly archiveEmailsToBeNotified: string[];

  @IsBoolean()
  @IsOptional()
  readonly retrieveEmailNotification: boolean;

  @IsArray()
  @IsOptional()
  readonly retrieveEmailsToBeNotified: string[];

  @IsNumber()
  @IsOptional()
  readonly embargoPeriod: number;
}
