import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class UpdatePublishedDataDto {
  @IsString()
  @IsOptional()
  readonly doi?: string;

  @IsString()
  @IsOptional()
  readonly affiliation?: string;

  @IsString({
    each: true,
  })
  readonly creator: string[];

  @IsString()
  readonly publisher: string;

  @IsNumber()
  readonly publicationYear: number;

  @IsString()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly url?: string;

  @IsString()
  readonly abstract: string;

  @IsString()
  readonly dataDescription: string;

  @IsString()
  readonly resourceType: string;

  @IsNumber()
  @IsOptional()
  readonly numberOfFiles?: number;

  @IsNumber()
  @IsOptional()
  readonly sizeOfArchive?: number;

  @IsString({
    each: true,
  })
  readonly pidArray: string[];

  @IsString({
    each: true,
  })
  @IsOptional()
  readonly authors?: string[];

  @IsDateString()
  @IsOptional()
  readonly registeredTime?: Date;

  @IsString()
  @IsOptional()
  readonly status?: string;

  @IsString()
  @IsOptional()
  readonly scicatUser?: string;

  @IsString()
  @IsOptional()
  readonly thumbnail?: string;

  @IsString({
    each: true,
  })
  @IsOptional()
  readonly relatedPublications?: string[];

  @IsString()
  @IsOptional()
  readonly downloadLink?: string;
}

export class PartialUpdatePublishedDataDto extends PartialType(
  UpdatePublishedDataDto,
) {}
