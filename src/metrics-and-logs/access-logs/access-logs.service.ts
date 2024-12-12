import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AccessLogs, AccessLogsDocument } from "./schemas/access-log.schema";

export class AccessLogsService {
  constructor(
    @InjectModel(AccessLogs.name)
    private accessLogsModel: Model<AccessLogsDocument>,
  ) {}
  // Method to log/store metrics
  async create() {}
  async findById() {}
  async findAll() {}
}
