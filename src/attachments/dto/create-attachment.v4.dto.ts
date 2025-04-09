import { IsOptional, IsString } from "class-validator";
import { UpdateAttachmentDto } from "./update-attachment.v4.dto";

export class CreateAttachmentDto extends UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  readonly aid?: string;
}
