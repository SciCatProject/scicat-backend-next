import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { DataFileDto } from "../../common/dto/datafile.dto";
import { DataFile } from "../../common/schemas/datafile.schema";
import { OwnableDto } from "../../common/dto/ownable.dto";

export class UpdateDatablockDto extends OwnableDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Unique identifier given by the archive system to the stored datablock. This id is used when data is retrieved back.",
  })
  @IsString()
  readonly archiveId: string;

  @ApiProperty({
    type: Number,
    required: true,
    description:
      "Total size in bytes of all files in the datablock when on accessible.",
  })
  @IsInt()
  readonly size: number;

  @ApiProperty({
    type: Number,
    required: true,
    description:
      "Total size in bytes of all files in the datablock when on archived.",
  })
  @IsInt()
  readonly packedSize: number;

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
    type: String,
    required: true,
    description:
      "Version string defining the format of how data is packed and stored in archive.",
  })
  @IsString()
  readonly version: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DataFileDto)
  readonly dataFileList: DataFile[];
}

export class PartialUpdateDatablockDto extends PartialType(
  UpdateDatablockDto,
) {}
