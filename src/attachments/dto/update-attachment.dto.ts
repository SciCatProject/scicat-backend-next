import { IsBoolean, IsOptional, IsString } from "class-validator";
import { OwnableDto } from "../../common/dto/ownable.dto";
import { PartialType } from "@nestjs/swagger";
import { AttachmentRelationshipClass } from "../schemas/relationship.schema";

export class UpdateAttachmentDto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly thumbnail?: string;

  @IsString()
  readonly caption: string;

  @IsOptional()
  readonly relationships?: AttachmentRelationshipClass[];

  @IsBoolean()
  isPublished: boolean;
}

export class PartialUpdateAttachmentDto extends PartialType(
  UpdateAttachmentDto,
) {}
