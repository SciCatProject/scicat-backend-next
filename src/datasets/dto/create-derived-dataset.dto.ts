import { ApiProperty } from "@nestjs/swagger";
import { CreateDatasetDto } from "./create-dataset.dto";

export class CreateDerivedDatasetDto extends CreateDatasetDto {
  @ApiProperty()
  readonly investigator: string;

  @ApiProperty()
  readonly inputDatasets: string[];

  @ApiProperty()
  readonly usedSoftware: string[];

  @ApiProperty({ type: Object })
  readonly jobParameters: Record<string, any>;

  @ApiProperty()
  readonly jobLogData: string;

  @ApiProperty({ type: Object })
  readonly scientificMetadata: Record<string, any>;
}
