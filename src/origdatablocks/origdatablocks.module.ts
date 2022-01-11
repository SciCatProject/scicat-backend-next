import { Module } from "@nestjs/common";
import { OrigdatablocksService } from "./origdatablocks.service";
import { OrigdatablocksController } from "./origdatablocks.controller";

@Module({
  controllers: [OrigdatablocksController],
  providers: [OrigdatablocksService],
})
export class OrigdatablockModule {}
