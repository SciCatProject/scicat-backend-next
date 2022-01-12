import { ApiProperty } from "@nestjs/swagger";
import { DataFile } from "../../common/schemas/datafile.schema";

export class CreateOrigdatablockDto {
  @ApiProperty()
  readonly datasetId: string;

  @ApiProperty()
  ownerGroup: string;

  @ApiProperty({ type: [String] })
  accessGroups: string[];

  @ApiProperty()
  readonly size: number;

  @ApiProperty({ type: [DataFile] })
  dataFileList: DataFile[];
}
