import { Module } from "@nestjs/common";
import { LogJobActionCreator } from "./logaction.service";

@Module({
  providers: [LogJobActionCreator],
  exports: [LogJobActionCreator],
})
export class LogJobActionModule {}
