import { ApiProperty, PartialType } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from "class-validator";
import { DataFile } from "src/common/schemas/datafile.schema";
import { Type } from "class-transformer";
import { DataFileDto } from "src/common/dto/datafile.dto";

export class UpdateOrigDatablockDto extends OwnableDto {
  @ApiProperty({
    type: Number,
    required: true,
    description: "Total size of the files in this orig datablock",
  })
  @IsInt()
  readonly size: number;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Name of the hashing algorithm used to compute the hash for each file.",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly chkAlg: string;

  @ApiProperty({
    type: DataFile,
    isArray: true,
    required: true,
    description: "List of the files contained in this orig datablock.",
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DataFileDto)
  readonly dataFileList: DataFile[];

  @ApiProperty({
    type: String,
    required: false,
    description:
      "Name of the group owning this item. If it is not specified, the datasets owner group is used.",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare readonly ownerGroup: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    description: "Flag is true when data are made publicly available.",
  })
  @IsOptional()
  @IsBoolean()
  readonly isPublished?: boolean;
}

export class PartialUpdateOrigDatablockDto extends PartialType(
  UpdateOrigDatablockDto,
) {}
