import { Module } from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { PublishedDataController } from "./published-data.controller";

@Module({
  controllers: [PublishedDataController],
  providers: [PublishedDataService],
})
export class PublishedDataModule {}
