import { Module } from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { PublishedDataController } from "./published-data.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  PublishedData,
  PublishedDataSchema,
} from "./schemas/published-data.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { ProposalsModule } from "src/proposals/proposals.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    AttachmentsModule,
    ConfigModule,
    DatasetsModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
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
    ]),
    ProposalsModule,
  ],
  controllers: [PublishedDataController],
  providers: [PublishedDataService, CaslAbilityFactory],
})
export class PublishedDataModule {}
