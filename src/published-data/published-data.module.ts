import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { ProposalsModule } from "src/proposals/proposals.module";
import { historyPlugin } from "../common/mongoose/plugins/history.plugin";
import {
  GenericHistory,
  GenericHistorySchema,
} from "../common/schemas/generic-history.schema";
import { getCurrentUsername } from "../common/utils/request-context.util";
import { PublishedDataController } from "./published-data.controller";
import { PublishedDataService } from "./published-data.service";
import {
  PublishedData,
  PublishedDataSchema,
} from "./schemas/published-data.schema";

@Module({
  imports: [
    CaslModule,
    AttachmentsModule,
    DatasetsModule,
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: GenericHistory.name,
        schema: GenericHistorySchema,
      },
    ]),
    HttpModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get("httpTimeOut"),
        maxRedirects: configService.get("httpMaxRedirects"),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeatureAsync([
      {
        name: PublishedData.name,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = PublishedDataSchema;

          schema.pre<PublishedData>("save", function (next) {
            // if _id is empty or different than doi,
            // set _id to doi
            if (!this._id) {
              this._id = this.doi;
            }
            next();
          });
          schema.plugin(historyPlugin, {
            historyModelName: GenericHistory.name,
            modelName: "PublishedData",
            configService: configService,
            getActiveUser: () => {
              return getCurrentUsername();
            },
          });

          return schema;
        },
      },
    ]),
    ProposalsModule,
  ],
  controllers: [PublishedDataController],
  providers: [PublishedDataService],
})
export class PublishedDataModule {}
