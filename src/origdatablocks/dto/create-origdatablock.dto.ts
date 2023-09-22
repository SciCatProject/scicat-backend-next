import {Type} from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateNested,
} from "class-validator";
import {DataFileDto} from "src/common/dto/datafile.dto";
import {OwnableDto} from "src/common/dto/ownable.dto";
import {DataFile} from "../../common/schemas/datafile.schema";
import {ApiProperty, getSchemaPath} from "@nestjs/swagger";

export class CreateOrigDatablockDto extends OwnableDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Persistent identifier of the dataset this orig datablock belongs to.",
  })
  @IsString()
  readonly datasetId: string;

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
    type: "array",
    items: {$ref: getSchemaPath(DataFile)},
    required: true,
    description: "List of the files contained in this orig datablock.",
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({each: true})
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
}
