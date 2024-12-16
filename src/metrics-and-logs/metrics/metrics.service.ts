import { InjectModel } from "@nestjs/mongoose";
import { Metrics, MetricsDocument } from "./schemas/metrics.schema";
import { FilterQuery, Model, ProjectionType, QueryOptions } from "mongoose";
import { AccessLogsService } from "../access-logs/access-logs.service";

export class MetricsService {
  constructor(
    @InjectModel(Metrics.name)
    private metricsModel: Model<MetricsDocument>,
    private readonly accessLogsService: AccessLogsService,
  ) {}
  async create(metricsData: Metrics): Promise<Metrics> {
    const metrics = new this.metricsModel(metricsData);
    return metrics.save();
  }

  async find(
    query: FilterQuery<MetricsDocument>,
    projection: ProjectionType<MetricsDocument> | null | undefined,
    options: QueryOptions<MetricsDocument> | null | undefined,
  ): Promise<Metrics[]> {
    return this.metricsModel.find(query, projection, options).exec();
  }
}
