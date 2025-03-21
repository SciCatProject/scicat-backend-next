import { forwardRef, Module } from "@nestjs/common";
import { OrigDatablocksService } from "./origdatablocks.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  OrigDatablock,
  OrigDatablockSchema,
} from "./schemas/origdatablock.schema";
import { OrigDatablocksController } from "./origdatablocks.controller";

import { CaslModule } from "src/casl/casl.module";
import { DatasetsModule } from "src/datasets/datasets.module";

@Module({
  imports: [
    CaslModule,
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
  providers: [OrigDatablocksService],
})
export class OrigDatablocksModule {}
