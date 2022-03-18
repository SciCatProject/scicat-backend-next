import { ApiProperty } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";
import { DataFile } from "src/common/schemas/datafile.schema";

export class CreateDatablockDto extends OwnableDto {
  @ApiProperty()
  readonly ownerGroup: string;

  @ApiProperty({ type: [String] })
  readonly accessGroups: string[];

  @ApiProperty()
  readonly datasetId: string;

  @ApiProperty()
  readonly archiveId: string;

  @ApiProperty()
  readonly size: number;

  @ApiProperty()
  readonly packedSize: number;

  @ApiProperty()
  readonly chkAlg: string;

  @ApiProperty()
  readonly version: string;

  @ApiProperty({ type: [DataFile] })
  readonly dataFileList: DataFile[];
}
