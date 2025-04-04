import { IsOptional, IsString } from "class-validator";
import { OwnableDto } from "../../common/dto/ownable.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateAttachmentV3Dto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly thumbnail?: string;

  @IsString()
  readonly caption: string;
}

export class PartialUpdateAttachmentV3Dto extends PartialType(
  UpdateAttachmentV3Dto,
) {}
