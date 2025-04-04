import { IsOptional, IsString } from "class-validator";
import { UpdateAttachmentV3Dto } from "./update-attachment.v3.dto";

export class CreateAttachmentV3Dto extends UpdateAttachmentV3Dto {
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
