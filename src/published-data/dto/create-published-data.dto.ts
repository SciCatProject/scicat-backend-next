import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreatePublishedDataDto {
  @IsString()
  @IsOptional()
  readonly _id?: string;

  @IsString()
  @IsOptional()
  readonly doi?: string;

  @IsString()
  @IsOptional()
  readonly affiliation?: string;

  @IsArray()
  @ArrayNotEmpty()
  readonly creator: string[];

  @IsString()
  readonly publisher: string;

  @IsNumber()
  readonly publicationYear: number;

  @IsString()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly url: string;

  @IsString()
  readonly abstract: string;

  @IsString()
  readonly dataDescription: string;

  @IsString()
  readonly resourceType: string;

  @IsNumber()
  @IsOptional()
  readonly numberOfFiles: number;

  @IsNumber()
  @IsOptional()
  readonly sizeOfArchive: number;

  @IsArray()
  @ArrayNotEmpty()
  readonly pidArray: string[];

  @IsArray()
  @IsOptional()
  readonly authors: string[];

  @IsDateString()
  @IsOptional()
  readonly registeredTime: Date;

  @IsString()
  @IsOptional()
  readonly status: string;

  @IsString()
  @IsOptional()
  readonly scicatUser: string;

  @IsString()
  @IsOptional()
  readonly thumbnail: string;

  @IsArray()
  @IsOptional()
  readonly relatedPublications: string[];

  @IsString()
  @IsOptional()
  readonly downloadLink: string;
}
