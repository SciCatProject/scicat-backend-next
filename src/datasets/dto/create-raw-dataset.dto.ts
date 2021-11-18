import { ApiProperty } from "@nestjs/swagger";
import { CreateDatasetDto } from "./create-dataset.dto";

export class CreateRawDatasetDto extends CreateDatasetDto {
  @ApiProperty()
  readonly principalInvestigator: string;

  @ApiProperty({ type: Date })
  readonly endTime: Date;

  @ApiProperty()
  readonly creationLocation: string;

  @ApiProperty()
  readonly dataFormat: string;

  @ApiProperty({ type: Object })
  readonly scientificMetadata: Record<string, unknown>;
}
