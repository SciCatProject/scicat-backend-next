import { forwardRef, Module } from "@nestjs/common";
import { OrigDatablocksService } from "./origdatablocks.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  OrigDatablock,
  OrigDatablockSchema,
} from "./schemas/origdatablock.schema";
import { OrigDatablocksController } from "./origdatablocks.controller";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";

@Module({
  imports: [
    forwardRef(() => DatasetsModule),
    MongooseModule.forFeature([
      {
        name: OrigDatablock.name,
        schema: OrigDatablockSchema,
      },
    ]),
  ],
  controllers: [OrigDatablocksController],
  exports: [OrigDatablocksService],
  providers: [OrigDatablocksService, CaslAbilityFactory],
})
export class OrigDatablocksModule {}
