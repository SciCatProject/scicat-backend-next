import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { MetricsController } from "../metrics.controller";

@Injectable()
export class MetricsCronTask {
  constructor(private readonly metricsController: MetricsController) {}

  @Cron("0 0 * * *") // Run daily at midnight
  async handleCron() {
    Logger.log("Running daily metrics compaction...");
  }
}
