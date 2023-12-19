import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GrayLogger } from "./logger.service";

@Module({
  imports: [ConfigModule],
  providers: [GrayLogger],
  exports: [GrayLogger],
})
export class LoggerModule {}
