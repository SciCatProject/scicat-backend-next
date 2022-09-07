import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { isString } from "lodash";
import { OwnableDto } from "src/common/dto/ownable.dto";

export class CreateAttachmentDto extends OwnableDto {
  @IsOptional()
  @IsString()
  readonly id: string;

  /* @ApiProperty({
    type: String,
    required: true,
    description:
      "Contains a thumbnail preview in base64 encoded png format for a given dataset",
  }) */
  @IsOptional()
  @IsString()
  readonly thumbnail: string;

  /* @ApiProperty({
    type: String,
    required: true,
    description: "Attachment caption to show in catanie",
  }) */
  @IsString()
  readonly caption: string;

  //@ApiProperty({ type: String })
  //readonly createdBy: string;

  //@ApiProperty({ type: String })
  //readonly updatedBy: string;

  //@ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly datasetId: string;

  //@ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly proposalId: string;

  //@ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly sampleId: string;
}
