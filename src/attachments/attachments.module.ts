import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AttachmentsService } from "./attachments.service";
import { Attachment, AttachmentSchema } from "./schemas/attachment.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Attachment.name,
        schema: AttachmentSchema,
      },
    ]),
  ],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
