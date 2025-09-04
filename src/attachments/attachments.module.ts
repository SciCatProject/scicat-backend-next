import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CaslModule } from "src/casl/casl.module";
import {
  GenericHistory,
  GenericHistorySchema,
} from "../common/schemas/generic-history.schema";
import { AttachmentsService } from "./attachments.service";
import { AttachmentsV4Controller } from "./attachments.v4.controller";
import { AttachmentsV4Service } from "./attachments.v4.service";
import { Attachment, AttachmentSchema } from "./schemas/attachment.schema";
import { applyHistoryPluginOnce } from "src/common/mongoose/plugins/history.plugin.util";

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

          // Apply history plugin once if schema name matches TRACKABLES config
          applyHistoryPluginOnce(schema, configService);

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
