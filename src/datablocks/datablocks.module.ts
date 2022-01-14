import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DatablocksService } from "./datablocks.service";
import { Datablock, DatablockSchema } from "./schemas/datablock.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Datablock.name,
        schema: DatablockSchema,
      },
    ]),
  ],
  providers: [DatablocksService],
  exports: [DatablocksService],
})
export class DatablocksModule {}
