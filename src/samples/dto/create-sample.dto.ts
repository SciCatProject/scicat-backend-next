import { ApiProperty } from "@nestjs/swagger";

export class CreateSampleDto {
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
