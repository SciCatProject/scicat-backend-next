import {IsOptional, IsString} from "class-validator";
import {OwnableDto} from "src/common/dto/ownable.dto";

export class CreateAttachmentDto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly id?: string;

  @IsOptional()
  @IsString()
  readonly thumbnail?: string;

  @IsString()
  readonly caption: string;

  @IsOptional()
  @IsString()
  readonly datasetId?: string;

  @IsOptional()
  @IsString()
  readonly proposalId?: string;

  @IsOptional()
  @IsString()
  readonly sampleId?: string;
}
