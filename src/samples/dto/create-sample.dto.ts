import { ApiProperty } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreateSampleDto extends OwnableDto {
  @ApiProperty()
  readonly ownerGroup: string;

  @ApiProperty()
  readonly accessGroups: string[];

  @ApiProperty()
  readonly owner: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly sampleCharacteristics: Record<string, unknown>;

  @ApiProperty()
  readonly isPublished: boolean;
}
