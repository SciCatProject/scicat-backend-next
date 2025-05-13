import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { OwnableDto } from "../../common/dto/ownable.dto";
import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { AttachmentRelationshipsV4Dto } from "./attachment-relationships.v4.dto";

export class UpdateAttachmentV4Dto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly thumbnail?: string;

  @IsString()
  readonly caption: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentRelationshipsV4Dto)
  readonly relationships?: AttachmentRelationshipsV4Dto[];

  @IsBoolean()
  isPublished: boolean;
}

export class PartialUpdateAttachmentV4Dto extends PartialType(
  UpdateAttachmentV4Dto,
) {}
