import { ApiProperty } from "@nestjs/swagger";
import { DataFile } from "../../common/schemas/datafile.schema";

export class CreateOrigdatablockDto {
  @ApiProperty()
  readonly datasetId: string;

  @ApiProperty()
  readonly ownerGroup: string;

  @ApiProperty({ type: [String] })
  readonly accessGroups: string[];

  @ApiProperty()
  readonly size: number;

  @ApiProperty({ type: [DataFile] })
  readonly dataFileList: DataFile[];
}
