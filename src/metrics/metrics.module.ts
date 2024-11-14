import { Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import {
  makeCounterProvider,
  PrometheusModule,
} from "@willsoto/nestjs-prometheus";
import { MongooseModule } from "@nestjs/mongoose";
import { MetricsClass, MetricsSchema } from "./schemas/metrics.schema";
import { MetricsDailySyncService } from "./metrics-daily-sync.service";
import { MetricsType } from "./interfaces/metrics-type.enum";

@Module({
  imports: [
    PrometheusModule.register(),
    MongooseModule.forFeature([
      {
        name: MetricsClass.name,
        schema: MetricsSchema,
      },
    ]),
  ],
  providers: [
    MetricsService,
    MetricsDailySyncService,
    makeCounterProvider({
      name: MetricsType.VIEWS,
      help: "Counter for dataset views",
      labelNames: ["datasetPid", "isPublished"], // TODO: is it possible to not hardcode this here?
    }),
    makeCounterProvider({
      name: MetricsType.DOWNLOADS,
      help: "Counter for dataset downloads",
      labelNames: ["datasetPid", "isPublished"],
    }),
    makeCounterProvider({
      name: MetricsType.QUERIES,
      help: "Counter for dataset queries",
      labelNames: ["datasetPid", "isPublished"],
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
