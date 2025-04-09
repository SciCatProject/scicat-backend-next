import { IsOptional, IsString } from "class-validator";
import { UpdateAttachmentV4Dto } from "./update-attachment.v4.dto";

export class CreateAttachmentV4Dto extends UpdateAttachmentV4Dto {
  @IsOptional()
  @IsString()
  readonly aid?: string;
}
