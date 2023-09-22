import {ApiProperty, ApiTags} from "@nestjs/swagger";
import {IsObject, IsOptional, IsString} from "class-validator";

@ApiTags("instruments")
export class CreateInstrumentDto {
  @ApiProperty({
    type: String,
    uniqueItems: true,
    required: true,
  })
  @IsString()
  readonly uniqueName: string;

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
