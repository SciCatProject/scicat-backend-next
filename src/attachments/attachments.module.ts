import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CaslModule } from "src/casl/casl.module";
import { historyPlugin } from "../common/mongoose/plugins/history.plugin";
import {
  GenericHistory,
  GenericHistorySchema,
} from "../common/schemas/generic-history.schema";
import { getCurrentUsername } from "../common/utils/request-context.util";
import { AttachmentsService } from "./attachments.service";
import { AttachmentsV4Controller } from "./attachments.v4.controller";
import { AttachmentsV4Service } from "./attachments.v4.service";
import { Attachment, AttachmentSchema } from "./schemas/attachment.schema";

@Module({
  imports: [
    CaslModule,
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: GenericHistory.name,
        schema: GenericHistorySchema,
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: Attachment.name,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = AttachmentSchema;

          schema.pre<Attachment>("save", function (next) {
            // if _id is empty or differnet than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.aid;
            }
            next();
          });

          schema.plugin(historyPlugin, {
            historyModelName: GenericHistory.name,
            modelName: "Attachment",
            configService: configService,
            getActiveUser: () => {
              return getCurrentUsername();
            },
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
