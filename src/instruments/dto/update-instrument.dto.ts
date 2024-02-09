import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";

export class UpdateInstrumentDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    type: Object,
    required: false,
    default: {},
  })
  @IsOptional()
  @IsObject()
  readonly customMetadata?: Record<string, unknown>;
}

export class PartialUpdateInstrumentDto extends PartialType(
  UpdateInstrumentDto,
) {}
