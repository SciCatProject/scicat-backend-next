import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class OwnableDto {

  @IsString()
  readonly ownerGroup: string;

  @IsOptional()
  @IsString({
    each: true,
  })
  readonly accessGroups?: string[];

  @IsOptional()
  @IsString()
  readonly instrumentGroup?: string;

}
