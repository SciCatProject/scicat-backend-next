import { UpdateDatasetObsoleteDto } from "./update-dataset-obsolete.dto";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";

export class UpdateDerivedDatasetObsoleteDto extends UpdateDatasetObsoleteDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "First name and last name of the person or people pursuing the data analysis. The string may contain a list of names, which should then be separated by semicolons.",
  })
  @IsString()
  readonly investigator: string;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "Array of input dataset identifiers used in producing the derived dataset. Ideally these are the global identifier to existing datasets inside this or federated data catalogs.",
  })
  @IsString({
    each: true,
  })
  readonly inputDatasets: string[];

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "A list of links to software repositories which uniquely identifies the pieces of software, including versions, used for yielding the derived data.",
  })
  @IsString({
    each: true,
  })
  readonly usedSoftware: string[];

  @ApiProperty({
    type: Object,
    required: false,
    description:
      "The creation process of the derived data will usually depend on input job parameters. The full structure of these input parameters are stored here.",
  })
  @IsOptional()
  @IsObject()
  readonly jobParameters?: Record<string, unknown>;

  @ApiProperty({
    type: String,
    required: false,
    description:
      "The output job logfile. Keep the size of this log data well below 15 MB.",
  })
  @IsOptional()
  @IsString()
  readonly jobLogData?: string;
}

export class PartialUpdateDerivedDatasetObsoleteDto extends PartialType(
  UpdateDerivedDatasetObsoleteDto,
) {}
