import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {AttachmentsService} from "./attachments.service";
import {Attachment, AttachmentSchema} from "./schemas/attachment.schema";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Attachment.name,
        //schema: AttachmentSchema,

        useFactory: () => {
          const schema = AttachmentSchema;

          schema.pre<Attachment>("save", function (next) {
            // if _id is empty or differnet than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.id;
            }
            next();
          });

          return schema;
        },
      },
    ]),
  ],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
