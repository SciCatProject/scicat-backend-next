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
import { InstrumentsController } from "./instruments.controller";
import { InstrumentsService } from "./instruments.service";
import { Instrument, InstrumentSchema } from "./schemas/instrument.schema";

@Module({
  controllers: [InstrumentsController],
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
        name: Instrument.name,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = InstrumentSchema;

          schema.pre<Instrument>("save", function (next) {
            // if _id is empty or different than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.pid;
            }
            next();
          });

          schema.plugin(historyPlugin, {
            historyModelName: GenericHistory.name,
            modelName: "Instrument",
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
  providers: [InstrumentsService],
})
export class InstrumentsModule {}
