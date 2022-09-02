import { ApiProperty } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";
import { Lifecycle } from "../schemas/lifecycle.schema";
import { Technique } from "../schemas/technique.schema";
import { Relationship } from "../schemas/relationship.schema";
import {
  IsString,
  IsOptional,
  IsEmail,
  IsFQDN,
  IsInt,
  IsDate,
  IsBoolean,
  ValidateNested,
} from "class-validator";

export class CreateDatasetDto extends OwnableDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly pid: string;

  @ApiProperty()
  @IsString()
  readonly owner: string;

  @ApiProperty()
  @IsEmail()
  readonly ownerEmail: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly orcidOfOwner: string;

  @ApiProperty()
  @IsEmail()
  readonly contactEmail: string;

  @ApiProperty()
  @IsString()
  readonly sourceFolder: string;

  @ApiProperty()
  @IsOptional()
  @IsFQDN()
  readonly sourceFolderHost: string;

  @ApiProperty()
  @IsInt()
  readonly size: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly packedSize: number;

  @ApiProperty()
  @IsInt()
  readonly numberOfFiles: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly numberOfFilesArchived: number;

  @ApiProperty({ type: Date })
  @IsDate()
  readonly creationTime: Date;

  @ApiProperty()
  @IsString()
  readonly type: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly validationStatus: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsString({
    each: true,
  })
  readonly keywords: string[];

  @ApiProperty({ description: "Dataset description" })
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsString()
  readonly datasetName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly classification: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly license: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly version: string;

  @ApiProperty()
  @IsBoolean()
  readonly isPublished: boolean;

  @ApiProperty()
  @IsString()
  readonly ownerGroup: string;

  @ApiProperty({ type: [String] })
  @IsString({
    each: true,
  })
  readonly accessGroups: string[];

  /*
   *  @ApiProperty({ type: [Object] })
   *  @IsOptional()
   *  readonly history: Record<string, unknown>[];

   *  @ApiProperty({ type: Lifecycle })
   *  readonly datasetlifecycle: Lifecycle;

   *  @ApiProperty({ type: Date })
   *  readonly createdAt: Date;

   *  @ApiProperty({ type: Date })
   *  readonly updatedAt: Date;
   */

  @ApiProperty({ type: [Technique] })
  @IsOptional()
  @ValidateNested()
  readonly techniques: Technique[];

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsString({
    each: true,
  })
  readonly sharedWith: string[];

  @ApiProperty({ type: [Relationship] })
  @IsOptional()
  @ValidateNested()
  readonly relationships: Relationship[];
}
