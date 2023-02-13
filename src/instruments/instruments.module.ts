import { forwardRef, Module } from "@nestjs/common";
import { InstrumentsService } from "./instruments.service";
import { InstrumentsController } from "./instruments.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Instrument, InstrumentSchema } from "./schemas/instrument.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";

@Module({
  controllers: [InstrumentsController],
  imports: [
    forwardRef(() => DatasetsModule),
    MongooseModule.forFeatureAsync([
      {
        name: Instrument.name,
        useFactory: () => {
          const schema = InstrumentSchema;

          schema.pre<Instrument>("save", function (next) {
            // if _id is empty or different than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.pid;
            }
            next();
          });
          return schema;
        },
      },
    ]),
  ],
  providers: [InstrumentsService, CaslAbilityFactory],
})
export class InstrumentsModule {}
