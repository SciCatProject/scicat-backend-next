import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { OwnableDto } from "src/common/dto/ownable.dto";
import { DataFile } from "../../common/schemas/datafile.schema";

export class CreateOrigDatablockDto extends OwnableDto {
  @IsString()
  readonly datasetId: string;

  @IsInt()
  readonly size: number;

  @IsOptional()
  @IsString()
  readonly chkAlg: string;

  @ValidateNested()
  readonly dataFileList: DataFile[];
}
