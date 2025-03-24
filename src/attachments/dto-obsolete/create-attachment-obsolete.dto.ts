import { IsOptional, IsString } from "class-validator";
import { UpdateAttachmentObsoleteDto } from "./update-attachment-obsolete.dto";

export class CreateAttachmentObsoleteDto extends UpdateAttachmentObsoleteDto {
  @IsOptional()
  @IsString()
  readonly aid?: string;

  @IsOptional()
  @IsString()
  readonly datasetId?: string;

  @IsOptional()
  @IsString()
  readonly proposalId?: string;

  @IsOptional()
  @IsString()
  readonly sampleId?: string;
}
