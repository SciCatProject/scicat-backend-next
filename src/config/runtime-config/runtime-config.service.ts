import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { isEqual } from "lodash";
import { reconcileData } from "./utils";
import { OutputRuntimeConfigDto } from "./dto/runtime-config.dto";
import {
  RuntimeConfig,
  RuntimeConfigDocument,
} from "./schemas/runtime-config.schema";
import { computeDeltaWithOriginals } from "src/common/utils/delta.util";

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

    for (const configId of configList) await this.syncConfigDiff(configId);
  }

  async getConfig(id: string): Promise<OutputRuntimeConfigDto | null> {
    const data = await this.runtimeConfigModel.findOne({ _id: id }).lean();

    if (!data) {
      throw new NotFoundException(`Config '${id}' not found`);
    }
    return data;
  }

  async updateConfig(
    id: string,
    config: Record<string, unknown>,
    updatedBy: string,
  ): Promise<OutputRuntimeConfigDto | null> {
    const updatedDoc = await this.runtimeConfigModel.findByIdAndUpdate(
      { _id: id },
      { $set: { data: config, updatedBy } },
      { new: true },
    );

    if (!updatedDoc) {
      throw new NotFoundException(`Config '${id}' not found`);
    }
    Logger.log(
      `Updated app config entry '${id}' by user '${updatedBy}'`,
      "RuntimeConfigService",
    );

    return updatedDoc;
  }

  async syncConfigDiff(configId: string): Promise<void> {
    const autoSyncEnabled = this.configService.get<boolean>(
      `configSyncToDb.enabled`,
    );

    const sourceConfig =
      this.configService.get<Record<string, unknown>>(configId) || {};

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
        `Created runtime config entry '${configId}' with default values from json file`,
        "RuntimeConfigService",
      );
      return;
    }

    if (!autoSyncEnabled) return;

    const dbValue = existing.data || {};

    const updatedConfig = reconcileData(dbValue, sourceConfig) as Record<
      string,
      unknown
    >;

    if (isEqual(updatedConfig, dbValue)) {
      return;
    }

    const { delta, originals } = computeDeltaWithOriginals(
      dbValue,
      updatedConfig,
    );

    await this.runtimeConfigModel.updateOne(
      { _id: configId },
      { data: updatedConfig },
    );

    Logger.log(
      {
        before: JSON.stringify(originals),
        after: JSON.stringify(delta),
      },
      `RuntimeConfigService - [${configId}] synchronized changes`,
    );
  }
}
