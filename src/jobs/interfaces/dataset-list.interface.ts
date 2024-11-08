import { ApiProperty } from "@nestjs/swagger";

export class IDatasetList {
  @ApiProperty()
  pid: string;

  @ApiProperty({ type: String, isArray: true })
  files: string[];
}
