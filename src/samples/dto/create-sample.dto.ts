//import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsObject, IsOptional } from "class-validator";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreateSampleDto extends OwnableDto {
  @IsString()
  @IsOptional()
  readonly sampleId?: string;

  @IsString()
  @IsOptional()
  readonly owner?: string;

  @IsString()
  readonly description: string;

  @IsObject()
  @IsOptional()
  readonly sampleCharacteristics?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  readonly isPublished?: boolean;
}
