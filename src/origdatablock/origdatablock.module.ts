import { Module } from "@nestjs/common";
import { OrigdatablockService } from "./origdatablock.service";
import { OrigdatablockController } from "./origdatablock.controller";

@Module({
  controllers: [OrigdatablockController],
  providers: [OrigdatablockService],
})
export class OrigdatablockModule {}
