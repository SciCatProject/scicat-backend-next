import { ApiProperty } from "@nestjs/swagger";

export class CreateAttachmentDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      "Contains a thumbnail preview in base64 encoded png format for a given dataset",
  })
  readonly thumbnail: string;

  @ApiProperty({
    type: String,
    required: true,
    description: "Attachment caption to show in catanie",
  })
  readonly caption: string;

  @ApiProperty({ type: String, required: true })
  readonly ownerGroup: string;

  @ApiProperty({ type: [String], required: false })
  readonly accessGroups?: string[];

  @ApiProperty({ type: String })
  readonly createdBy: string;

  @ApiProperty({ type: String })
  readonly updatedBy: string;

  @ApiProperty({ type: String, required: false })
  readonly datasetId: string;

  @ApiProperty({ type: String, required: false })
  readonly proposalId: string;
}
