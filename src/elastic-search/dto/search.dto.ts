import { ApiTags, ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export interface SearchDtoParam {
  search_term: string;
}

@ApiTags("search-service")
export class SearchDto {
  @ApiProperty({
    type: String,
    required: true,
    default: "",
    description: "text query",
  })
  readonly text: string;

  @ApiProperty({
    type: Array,
    required: false,
    default: [],
    description: "ownerGroup",
  })
  @IsOptional()
  readonly ownerGroup: [];

  @ApiProperty({
    type: Array,
    required: false,
    default: [],
    description: "creationLocation",
  })
  @IsOptional()
  readonly creationLocation: [];

  @ApiProperty({
    type: Array,
    required: false,
    default: [],
    description: "type",
  })
  @IsOptional()
  readonly type: [];

  @ApiProperty({
    type: Array,
    required: false,
    default: [],
    description: "keywords",
  })
  @IsOptional()
  readonly keywords: [];

  @ApiProperty({
    type: Boolean,
    required: false,
    default: false,
    description: "isPublished",
  })
  @IsOptional()
  readonly isPublished: boolean;
}