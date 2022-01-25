import { Module } from "@nestjs/common";
import { SamplesService } from "./samples.service";
import { SamplesController } from "./samples.controller";

@Module({
  controllers: [SamplesController],
  providers: [SamplesService],
})
export class SamplesModule {}
