import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { historyPlugin } from "../common/mongoose/plugins/history.plugin";
import {
  GenericHistory,
  GenericHistorySchema,
} from "../common/schemas/generic-history.schema";
import { getCurrentUsername } from "../common/utils/request-context.util";
import { SamplesController } from "./samples.controller";
import { SamplesService } from "./samples.service";
import { SampleClass, SampleSchema } from "./schemas/sample.schema";

@Module({
  imports: [
    CaslModule,
    AttachmentsModule,
    DatasetsModule,
    ConfigModule,
    MongooseModule.forFeatureAsync([
      {
        name: SampleClass.name,
        imports: [
          ConfigModule,
          MongooseModule.forFeature([
            { name: GenericHistory.name, schema: GenericHistorySchema },
          ]),
        ],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = SampleSchema;

          schema.pre<SampleClass>("save", function (next) {
            // if _id is empty or different than sampleId,
            // set _id to sampleId
            if (!this._id) {
              this._id = this.sampleId;
            }
            next();
          });

          schema.plugin(historyPlugin, {
            historyModelName: GenericHistory.name,
            modelName: "Sample",
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
  controllers: [SamplesController],
  providers: [SamplesService],
})
export class SamplesModule {}
