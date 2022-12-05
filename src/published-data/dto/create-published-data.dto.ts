import { IsDateString, IsOptional, IsString, IsNumber } from "class-validator";

export class CreatePublishedDataDto {
  @IsString()
  @IsOptional()
  readonly _id?: string;

  @IsOptional()
  @IsString()
  readonly doi?: string;

  @IsOptional()
  @IsString()
  readonly affiliation: string;

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
  readonly url: string;

  @IsString()
  readonly abstract: string;

  @IsString()
  readonly dataDescription: string;

  @IsString()
  readonly resourceType: string;

  @IsNumber()
  readonly numberOfFiles: number;

  @IsNumber()
  readonly sizeOfArchive: number;

  @IsString({
    each: true,
  })
  readonly pidArray: string[];

  @IsOptional()
  @IsString({
    each: true,
  })
  readonly authors: string[];

  @IsOptional()
  @IsDateString()
  readonly registeredTime: Date;

  @IsOptional()
  @IsString()
  readonly status: string;

  @IsOptional()
  @IsString()
  readonly scicatUser: string;

  @IsOptional()
  @IsString()
  readonly thumbnail: string;

  @IsOptional()
  @IsString({
    each: true,
  })
  readonly relatedPublications: string[];

  @IsOptional()
  @IsString()
  readonly downloadLink: string;

  @IsDateString()
  @IsOptional()
  readonly createdAt?: Date;

  @IsDateString()
  @IsOptional()
  readonly updatedAt?: Date;
}
