import { OwnableDto } from "src/common/dto/ownable.dto";
import { Technique } from "../schemas/technique.schema";
import { Relationship } from "../schemas/relationship.schema";
import {
  IsString,
  IsOptional,
  IsEmail,
  IsFQDN,
  IsInt,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Lifecycle } from "../schemas/lifecycle.schema";

export class CreateDatasetDto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly pid: string;

  @IsString()
  readonly owner: string;

  @IsEmail()
  readonly ownerEmail: string;

  @IsOptional()
  @IsString()
  readonly orcidOfOwner: string;

  @IsEmail()
  readonly contactEmail: string;

  @IsString()
  readonly sourceFolder: string;

  @IsOptional()
  @IsFQDN()
  readonly sourceFolderHost: string;

  @IsInt()
  readonly size: number;

  @IsOptional()
  @IsInt()
  readonly packedSize: number;

  @IsOptional()
  @IsInt()
  readonly numberOfFiles: number;

  @IsOptional()
  @IsInt()
  readonly numberOfFilesArchived: number;

  @IsDateString()
  readonly creationTime: Date;

  @IsString()
  readonly type: string;

  @IsOptional()
  @IsString()
  readonly validationStatus: string;

  @IsOptional()
  @IsString({
    each: true,
  })
  readonly keywords: string[];

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly datasetName: string;

  @IsOptional()
  @IsString()
  readonly classification: string;

  @IsOptional()
  @IsString()
  readonly license: string;

  @IsOptional()
  @IsString()
  readonly version: string;

  @IsBoolean()
  readonly isPublished: boolean;

  @IsOptional()
  @ValidateNested()
  readonly techniques: Technique[];

  @IsOptional()
  @IsString({
    each: true,
  })
  readonly sharedWith: string[];

  @IsOptional()
  @ValidateNested()
  readonly relationships: Relationship[];

  @IsOptional()
  readonly datasetlifecycle: Lifecycle;

  @IsOptional()
  @IsObject()
  readonly scientificMetadata: Record<string, unknown>;
}
