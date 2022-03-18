import { ApiProperty } from "@nestjs/swagger";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreateAttachmentDto extends OwnableDto {
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

  @ApiProperty({ type: String })
  readonly createdBy: string;

  @ApiProperty({ type: String })
  readonly updatedBy: string;

  @ApiProperty({ type: String, required: false })
  readonly datasetId: string;

  @ApiProperty({ type: String, required: false })
  readonly proposalId: string;

  @ApiProperty({ type: String, required: false })
  readonly sampleId: string;
}
