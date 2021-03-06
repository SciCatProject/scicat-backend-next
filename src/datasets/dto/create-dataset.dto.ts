import { ApiProperty } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";
import { Lifecycle } from "../schemas/lifecycle.schema";
import { Technique } from "../schemas/technique.schema";

export class CreateDatasetDto extends OwnableDto {
  @ApiProperty()
  readonly owner: string;

  @ApiProperty()
  readonly ownerEmail: string;

  @ApiProperty()
  readonly orcidOfOwner: string;

  @ApiProperty()
  readonly contactEmail: string;

  @ApiProperty()
  readonly sourceFolder: string;

  @ApiProperty()
  readonly sourceFolderHost: string;

  @ApiProperty()
  readonly size: number;

  @ApiProperty()
  readonly packedSize: number;

  @ApiProperty()
  readonly numberOfFiles: number;

  @ApiProperty()
  readonly numberOfFilesArchived: number;

  @ApiProperty({ type: Date })
  readonly creationTime: Date;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly validationStatus: string;

  @ApiProperty({ type: [String] })
  readonly keywords: string[];

  @ApiProperty({ description: "Dataset description" })
  readonly description: string;

  @ApiProperty()
  readonly datasetName: string;

  @ApiProperty()
  readonly classification: string;

  @ApiProperty()
  readonly license: string;

  @ApiProperty()
  readonly version: string;

  @ApiProperty()
  readonly isPublished: boolean;

  @ApiProperty({ type: [Object] })
  readonly history: Record<string, unknown>[];

  @ApiProperty({ type: Lifecycle })
  readonly datasetlifecycle: Lifecycle;

  @ApiProperty({ type: Date })
  readonly createdAt: Date;

  @ApiProperty({ type: Date })
  readonly updatedAt: Date;

  @ApiProperty()
  readonly instrumentId: string;

  @ApiProperty({ type: [Technique] })
  readonly techniques: Technique[];

  @ApiProperty({ type: [String] })
  readonly sharedWith: string[];
}
