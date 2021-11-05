import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty({
    required: true,
    description:
      'Contains a thumbnail preview in base64 encoded png format for a given dataset',
  })
  readonly thumbnail: string;

  @ApiProperty({
    required: true,
    description: 'Attachment caption to show in catanie',
  })
  readonly caption: string;
}
