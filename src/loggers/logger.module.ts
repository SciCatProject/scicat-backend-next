import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScicatLogger } from "./logger.service";

@Module({
  imports: [ConfigModule],
  providers: [ScicatLogger],
  exports: [ScicatLogger],
})
export class LoggerModule {}
