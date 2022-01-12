import { Module } from "@nestjs/common";
import { DatablocksService } from "./datablocks.service";

@Module({
  providers: [DatablocksService],
})
export class DatablocksModule {}
