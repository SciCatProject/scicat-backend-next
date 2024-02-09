import { IsOptional, IsString } from "class-validator";
import { UpdateAttachmentDto } from "./update-attachment.dto";

export class CreateAttachmentDto extends UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  readonly id?: string;

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
