import { ApiProperty } from "@nestjs/swagger";

export class CreatePublishedDataDto {
  @ApiProperty({ required: false })
  readonly affiliation: string;

  @ApiProperty({ required: true })
  readonly creator: string[];

  @ApiProperty({ required: true })
  readonly publisher: string;

  @ApiProperty({ required: true })
  readonly publicationYear: number;

  @ApiProperty({ required: true })
  readonly title: string;

  @ApiProperty({ required: false })
  readonly url: string;

  @ApiProperty({ required: true })
  readonly abstract: string;

  @ApiProperty({ required: true })
  readonly dataDescription: string;

  @ApiProperty({ required: true })
  readonly resourceType: string;

  @ApiProperty({ required: false })
  readonly numberOfFiles: number;

  @ApiProperty({ required: false })
  readonly sizeOfArchive: number;

  @ApiProperty({ required: true })
  readonly pidArray: string[];

  @ApiProperty({ required: false })
  readonly authors: string[];

  @ApiProperty()
  readonly registeredTime: Date;

  @ApiProperty({ required: false })
  readonly status: string;

  @ApiProperty({ required: false })
  readonly scicatUser: string;

  @ApiProperty({ required: false })
  readonly thumbnail: string;

  @ApiProperty({ required: false })
  readonly relatedPublications: string[];

  @ApiProperty({ required: false })
  readonly downloadLink: string;
}
