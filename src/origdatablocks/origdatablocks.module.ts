import { Module } from "@nestjs/common";
import { OrigdatablocksService } from "./origdatablocks.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  OrigDatablock,
  OrigDatablockSchema,
} from "./schemas/origdatablock.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OrigDatablock.name,
        schema: OrigDatablockSchema,
      },
    ]),
  ],
  providers: [OrigdatablocksService],
  exports: [OrigdatablocksService],
})
export class OrigdatablocksModule {}
