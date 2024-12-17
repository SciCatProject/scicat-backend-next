import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery, QueryOptions, ProjectionType } from "mongoose";
import { AccessLog, AccessLogDocument } from "./schemas/access-log.schema";

export class AccessLogsService {
  constructor(
    @InjectModel(AccessLog.name)
    private accessLogModel: Model<AccessLogDocument>,
  ) {}

  async create(accessLogData: AccessLog): Promise<AccessLog> {
    const accessLog = new this.accessLogModel(accessLogData);
    return accessLog.save();
  }

  async find(
    query: FilterQuery<AccessLogDocument>,
    projection: ProjectionType<AccessLogDocument> | null | undefined,
    options: QueryOptions<AccessLogDocument> | null | undefined,
  ): Promise<AccessLog[]> {
    return this.accessLogModel.find(query, projection, options).exec();
  }
}
