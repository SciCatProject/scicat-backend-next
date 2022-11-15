import { PartialType } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsOptional } from "class-validator";
import { CreateAttachmentDto } from "./create-attachment.dto";

export class UpdateAttachmentDto extends PartialType(CreateAttachmentDto) {
  @IsOptional()
  @Exclude()
  readonly id?: string;

  @IsOptional()
  @Exclude()
  readonly datasetId?: string;

  @IsOptional()
  @Exclude()
  readonly proposalId?: string;

  @IsOptional()
  @Exclude()
  readonly sampleId?: string;
}
