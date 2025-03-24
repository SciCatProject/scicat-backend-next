import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AttachmentsService } from "./attachments.service";
import { AttachmentsController } from "./attachments.v4.controller";
import { Attachment, AttachmentSchema } from "./schemas/attachment.schema";
import { CaslModule } from "src/casl/casl.module";

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
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
