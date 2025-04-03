import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AttachmentsService } from "./attachments.service";
import { AttachmentsV4Controller } from "./attachments.v4.controller";
import { Attachment, AttachmentSchema } from "./schemas/attachment.schema";
import { CaslModule } from "src/casl/casl.module";
import { AttachmentsV4Service } from "./attachments.v4.service";

@Module({
  imports: [
    CaslModule,
    MongooseModule.forFeatureAsync([
      {
        name: Attachment.name,
        useFactory: () => {
          const schema = AttachmentSchema;

          schema.pre<Attachment>("save", function (next) {
            // if _id is empty or differnet than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.aid;
            }
            next();
          });

          return schema;
        },
      },
    ]),
  ],
  controllers: [AttachmentsV4Controller],
  providers: [AttachmentsService, AttachmentsV4Service],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
