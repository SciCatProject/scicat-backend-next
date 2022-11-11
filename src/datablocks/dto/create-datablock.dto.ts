import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, ValidateNested } from "class-validator";
import { OwnableDto } from "src/common/dto/ownable.dto";
import { DataFile } from "src/common/schemas/datafile.schema";

export class CreateDatablockDto extends OwnableDto {
  @IsString()
  readonly datasetId: string;

  @IsString()
  readonly archiveId: string;

  @IsInt()
  readonly size: number;

  @IsInt()
  readonly packedSize: number;

  @IsOptional()
  @IsString()
  readonly chkAlg: string;

  @ValidateNested()
  readonly dataFileList: DataFile[];
}
