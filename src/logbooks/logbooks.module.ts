import { Module } from "@nestjs/common";
import { LogbooksService } from "./logbooks.service";
import { LogbooksController } from "./logbooks.controller";

@Module({
  controllers: [LogbooksController],
  providers: [LogbooksService],
})
export class LogbooksModule {}
