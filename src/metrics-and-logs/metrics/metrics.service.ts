import { InjectModel } from "@nestjs/mongoose";
import { Metrics, MetricsDocument } from "./schemas/metrics.schema";
import { Model } from "mongoose";

export class MetricsService {
  constructor(
    @InjectModel(Metrics.name)
    private metricsModel: Model<MetricsDocument>,
  ) {}
  // Method to log/store metrics
  async create() {}
  async findById() {}
  async findAll() {}
}
