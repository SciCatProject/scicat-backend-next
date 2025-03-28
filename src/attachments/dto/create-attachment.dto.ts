import { IsOptional, IsString } from "class-validator";
import { UpdateAttachmentDto } from "./update-attachment.dto";

export class CreateAttachmentDto extends UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  readonly aid?: string;
}
