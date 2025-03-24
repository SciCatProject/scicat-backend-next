import { IsBoolean, IsOptional, IsString } from "class-validator";
import { OwnableDto } from "../../common/dto/ownable.dto";
import { PartialType } from "@nestjs/swagger";
import { AttachmentRelationshipClass } from "../schemas/relationship.schema";

export class UpdateAttachmentObsoleteDto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly thumbnail?: string;

  @IsString()
  readonly caption: string;

  @IsBoolean()
  isPublished: boolean;
}

export class PartialUpdateAttachmentObsoleteDto extends PartialType(
  UpdateAttachmentObsoleteDto,
) {}
