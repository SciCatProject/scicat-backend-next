import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { DatablocksController } from "./datablocks.controller";
import { DatablocksService } from "./datablocks.service";
import { Datablock, DatablockSchema } from "./schemas/datablock.schema";

@Module({
  imports: [
    forwardRef(() => DatasetsModule),
    CaslModule,
    MongooseModule.forFeature([
      {
        name: Datablock.name,
        schema: DatablockSchema,
      },
    ]),
  ],
  controllers: [DatablocksController],
  providers: [DatablocksService],
  exports: [DatablocksService],
})
export class DatablocksModule {}
