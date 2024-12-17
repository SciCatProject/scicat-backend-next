import { Module } from "@nestjs/common";
import { ScicatLogger } from "./logger.service";

@Module({
  providers: [ScicatLogger],
  exports: [ScicatLogger],
})
export class LoggerModule {}
