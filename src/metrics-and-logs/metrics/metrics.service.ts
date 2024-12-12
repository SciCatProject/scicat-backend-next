import { InjectModel } from "@nestjs/mongoose";
import { Metrics, MetricsDocument } from "./schemas/metrics.schema";
import { Model } from "mongoose";
import { Logger } from "@nestjs/common";

export class MetricsService {
  accessLogsService: any;
  constructor(
    @InjectModel(Metrics.name)
    private metricsModel: Model<MetricsDocument>,
  ) {}

  async createMetric(metricData: Partial<Metrics>): Promise<Metrics> {
    const metric = new this.metricsModel(metricData);
    return metric.save();
  }

  async generateCompactMetrics() {
    Logger.log("Starting metrics compaction...");
    const rawLogs = await this.accessLogsService.findLogs({});
    // Compact logic here
    const compactedMetrics = this.compactLogs(rawLogs);
    await this.createMetric(compactedMetrics);
    Logger.log("Metrics compaction completed.");
  }

  private compactLogs(logs: any[]): Partial<Metrics> {
    // Implement compaction logic
    return {};
  }
}
