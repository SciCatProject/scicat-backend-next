import { Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Metrics, MetricsSchema } from "./schemas/metrics.schema";
import { AccessLogsModule } from "../access-logs/access-logs.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Metrics.name,
        schema: MetricsSchema,
      },
    ]),
    AccessLogsModule,
  ],
  providers: [MetricsService, MetricsController],
  exports: [],
})
export class MetricsModule {}
