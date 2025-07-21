import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { historyPlugin } from "../common/mongoose/plugins/history.plugin";
import {
  GenericHistory,
  GenericHistorySchema,
} from "../common/schemas/generic-history.schema";
import { getCurrentUsername } from "../common/utils/request-context.util";
import { DatablocksController } from "./datablocks.controller";
import { DatablocksService } from "./datablocks.service";
import { Datablock, DatablockSchema } from "./schemas/datablock.schema";

@Module({
  imports: [
    forwardRef(() => DatasetsModule),
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
        name: Datablock.name,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = DatablockSchema;

          schema.plugin(historyPlugin, {
            historyModelName: GenericHistory.name,
            modelName: "Datablock",
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
  controllers: [DatablocksController],
  providers: [DatablocksService],
  exports: [DatablocksService],
})
export class DatablocksModule {}
