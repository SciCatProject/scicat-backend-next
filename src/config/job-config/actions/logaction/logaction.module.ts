import { Module } from "@nestjs/common";
import { LogJobActionFactory } from "./logaction.factory";

@Module({
  providers: [LogJobActionFactory],
  exports: [LogJobActionFactory],
})
export class LogJobActionModule {}
