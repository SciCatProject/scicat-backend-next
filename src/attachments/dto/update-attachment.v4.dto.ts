import { IsBoolean, IsOptional, IsString } from "class-validator";
import { OwnableDto } from "../../common/dto/ownable.dto";
import { PartialType } from "@nestjs/swagger";
import { AttachmentRelationshipClass } from "../schemas/relationship.schema";

export class UpdateAttachmentV4Dto extends OwnableDto {
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

export class PartialUpdateAttachmentV4Dto extends PartialType(
  UpdateAttachmentV4Dto,
) {}
