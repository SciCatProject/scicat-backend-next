import { IsOptional, IsString } from "class-validator";
import { OwnableDto } from "../../common/dto/ownable.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateAttachmentDto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly thumbnail?: string;

  @IsString()
  readonly caption: string;
}

export class PartialUpdateAttachmentDto extends PartialType(
  UpdateAttachmentDto,
) {}
