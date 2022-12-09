import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsObject, IsOptional } from "class-validator";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreateSampleDto extends OwnableDto {
  @ApiProperty({
    type: String,
    required: false,
    description: "The owner of the sample",
  })
  @IsString()
  @IsOptional()
  readonly owner?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: "A description of the sample",
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({
    type: Object,
    default: {},
    required: false,
    description: "JSON object containing the sample characteristics metadata",
  })
  @IsObject()
  @IsOptional()
  readonly sampleCharacteristics?: Record<string, unknown>;

  @ApiProperty({
    type: Boolean,
    default: false,
    required: false,
    description: "Flag is true when data are made publicly available",
  })
  @IsBoolean()
  @IsOptional()
  readonly isPublished?: boolean;
}
