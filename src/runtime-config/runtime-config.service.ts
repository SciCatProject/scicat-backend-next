import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { isEqual } from "lodash";
import { reconcileData, diffChanges } from "./utils";
import { OutputRuntimeConfigDto } from "./dto/runtime-config.dto";
import {
  RuntimeConfig,
  RuntimeConfigDocument,
} from "./schemas/runtime-config.schema";

enum ConfigKeys {
  "frontend-config" = "frontendConfig",
  "frontend-theme" = "frontendTheme",
}

@Injectable()
export class RuntimeConfigService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectModel(RuntimeConfig.name)
    private runtimeConfigModel: Model<RuntimeConfigDocument>,
  ) {}

  async onModuleInit() {
    await this.syncConfigDiff("frontend-config", ConfigKeys["frontend-config"]);
    await this.syncConfigDiff("frontend-theme", ConfigKeys["frontend-theme"]);
  }

  async getConfig(id: string): Promise<OutputRuntimeConfigDto | null> {
    return await this.runtimeConfigModel.findOne({ _id: id }).lean();
  }

  async updateConfig(
    id: string,
    config: Record<string, unknown>,
    updatedBy: string,
  ): Promise<void> {
    await this.runtimeConfigModel.updateOne(
      { _id: id },
      { $set: { data: config, updatedBy } },
    );
    Logger.log(
      `Updated app config entry '${id}' by user '${updatedBy}'`,
      "AppConfigService",
    );
  }

  async syncConfigDiff(configId: string, configKey: string): Promise<void> {
    const autoSyncEnabled = this.configService.get<boolean>(
      `${configKey}DbAutoSyncEnabled`,
    );

    const sourceConfig =
      this.configService.get<Record<string, unknown>>(configKey) || {};

    const existing = await this.runtimeConfigModel
      .findOne({ _id: configId })
      .lean();

    // If no existing config, create one with default values
    if (!existing) {
      await this.runtimeConfigModel.create({
        _id: configId,
        data: sourceConfig,
      });
      Logger.log(
        `Created app config entry '${configId}' with default values from json file`,
        "AppConfigService",
      );
      return;
    }

    if (!autoSyncEnabled) return;

    const dbValue = existing.data || {};

    const updatedConfig = reconcileData(dbValue, sourceConfig);

    if (isEqual(updatedConfig, dbValue)) {
      return;
    }

    const changes = diffChanges(dbValue, updatedConfig);

    await this.runtimeConfigModel.updateOne(
      { _id: configId },
      { data: updatedConfig },
    );

    if (changes.length > 0) {
      Logger.log("Changed fields:");
      for (const c of changes) Logger.log("  • " + c);
    }
  }
}
