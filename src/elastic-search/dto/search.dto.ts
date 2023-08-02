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
    description: "Type any thing here",
  })
  @IsOptional()
  @IsString()
  readonly search_term: string;
}
