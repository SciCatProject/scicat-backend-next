import { Module } from "@nestjs/common";
import { OrigdatablockService } from "./origdatablocks.service";
import { OrigdatablockController } from "./origdatablocks.controller";

@Module({
  controllers: [OrigdatablockController],
  providers: [OrigdatablockService],
})
export class OrigdatablockModule {}
