import { ApiProperty } from "@nestjs/swagger";

export class CreateJobDto {
  @ApiProperty({ required: true })
  readonly emailJobInitiator: string;

  @ApiProperty({ required: true })
  readonly type: string;

  @ApiProperty({ required: true })
  readonly creationTime: Date;

  @ApiProperty({ required: false })
  readonly executionTime: Date;

  @ApiProperty({ required: false })
  readonly jobParams: Record<string, unknown>;

  @ApiProperty({ required: false })
  readonly jobStatusMessage: string;

  @ApiProperty({ required: false })
  readonly datasetList: Record<string, unknown>;

  @ApiProperty({ required: false })
  readonly jobResultObject: Record<string, unknown>;
}
