import { InjectModel } from "@nestjs/mongoose";
import { Metrics, MetricsDocument } from "./schemas/metrics.schema";
import { Model } from "mongoose";
import { AccessLogs, AccessLogsDocument } from "./schemas/access-log.schema";

export class MetricsService {
  constructor(
    @InjectModel(Metrics.name)
    private metricsModel: Model<MetricsDocument>,
    @InjectModel(AccessLogs.name)
    private accessLogsModel: Model<AccessLogsDocument>,
  ) {}
  // Method to log/store metrics
  async create() {}
  async findById() {}
  async findAll() {}
}
