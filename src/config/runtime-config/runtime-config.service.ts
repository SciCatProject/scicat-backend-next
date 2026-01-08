import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OutputRuntimeConfigDto } from "./dto/runtime-config.dto";
import {
  RuntimeConfig,
  RuntimeConfigDocument,
} from "./schemas/runtime-config.schema";

@Injectable()
export class RuntimeConfigService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectModel(RuntimeConfig.name)
    private runtimeConfigModel: Model<RuntimeConfigDocument>,
  ) {}

  async onModuleInit() {
    const configList: string[] = this.configService.get<string[]>(
      "configSyncToDb.configList",
    )!;

    for (const configId of configList) await this.syncConfig(configId);
  }

  async getConfig(cid: string): Promise<OutputRuntimeConfigDto | null> {
    const data = await this.runtimeConfigModel.findOne({ cid: cid }).lean();

    if (!data) {
      throw new NotFoundException(`Config '${cid}' not found`);
    }
    return data;
  }

  async updateConfig(
    cid: string,
    config: Record<string, unknown>,
    updatedBy: string,
  ): Promise<OutputRuntimeConfigDto | null> {
    const updatedDoc = await this.runtimeConfigModel.findOneAndUpdate(
      { cid: cid },
      { $set: { data: config, updatedBy } },
      { new: true },
    );

    if (!updatedDoc) {
      throw new NotFoundException(`Config '${cid}' not found`);
    }
    Logger.log(
      `Updated app config entry '${cid}' by user '${updatedBy}'`,
      "RuntimeConfigService",
    );

    return updatedDoc;
  }

  async syncConfig(configId: string): Promise<void> {
    const sourceConfig =
      this.configService.get<Record<string, unknown>>(configId) || {};

    if (!sourceConfig || Object.keys(sourceConfig).length === 0) {
      Logger.warn(
        `Config file: ${configId} is empty or missing, skipping sync`,
        "RuntimeConfigService",
      );
      return;
    }

    const existing = await this.runtimeConfigModel
      .findOne({ cid: configId })
      .lean();

    // If no existing config, create one from config file
    if (!existing) {
      await this.runtimeConfigModel.create({
        cid: configId,
        data: sourceConfig,
      });
      Logger.log(
        `Created runtime config entry: '${configId}' with config file`,
        "RuntimeConfigService",
      );
      return;
    }

    // overwrite existing config with config file
    await this.runtimeConfigModel.updateOne(
      { cid: configId },
      { data: sourceConfig },
    );

    Logger.log(
      `RuntimeConfigService - [${configId}] synchronized with config file`,
      "RuntimeConfigService",
    );
  }
}
