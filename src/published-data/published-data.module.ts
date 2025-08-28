import { Module } from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { PublishedDataController } from "./published-data.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  PublishedData,
  PublishedDataSchema,
} from "./schemas/published-data.schema";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { ProposalsModule } from "src/proposals/proposals.module";
import { ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { CaslModule } from "src/casl/casl.module";
import { PublishedDataV4Controller } from "./published-data.v4.controller";
import { PublishedDataV4Service } from "./published-data.v4.service";
import {
  PublishedDataV4,
  PublishedDataV4Schema,
} from "./schemas/published-data.v4.schema";

@Module({
  imports: [
    CaslModule,
    AttachmentsModule,
    DatasetsModule,
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
        useFactory: () => {
          const schema = PublishedDataSchema;

          schema.pre<PublishedData>("save", function (next) {
            // if _id is empty or different than doi,
            // set _id to doi
            if (!this._id) {
              this._id = this.doi;
            }
            next();
          });
          return schema;
        },
      },
      {
        name: PublishedDataV4.name,
        useFactory: () => {
          const schema = PublishedDataV4Schema;

          schema.pre<PublishedDataV4>("save", function (next) {
            // if _id is empty or different than doi,
            // set _id to doi
            if (!this._id) {
              this._id = this.doi;
            }
            next();
          });
          return schema;
        },
      },
    ]),
    ProposalsModule,
  ],
  controllers: [PublishedDataController, PublishedDataV4Controller],
  providers: [PublishedDataService, PublishedDataV4Service],
})
export class PublishedDataModule {}
