import { forwardRef, Module } from "@nestjs/common";
import { OrigDatablocksService } from "./origdatablocks.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  OrigDatablock,
  OrigDatablockSchema,
} from "./schemas/origdatablock.schema";
import { OrigDatablocksController } from "./origdatablocks.controller";
import { DatasetsModule } from "src/datasets/datasets.module";
import { CaslModule } from "src/casl/casl.module";

@Module({
  imports: [
    forwardRef(() => DatasetsModule),
    CaslModule,
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
