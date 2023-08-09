import { ApiTags, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SearchDtoParam {
  search_term: string;
}

@ApiTags("search-service")
export class SearchDto {
  @ApiProperty({
    type: String,
    required: false,
    default: "",
    description: "text query",
  })
  @IsOptional()
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
    default: "",
    description: "keywords",
  })
  @IsOptional()
  readonly keywords: [];
}
