import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig, AppConfigDocument } from "./schemas/app-config.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class AppConfigService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectModel(AppConfig.name)
    private appConfigModel: Model<AppConfigDocument>,
  ) {}

  async onModuleInit() {
    await this.getOrCreateAppConfig();
  }

  async getConfig(): Promise<Record<string, unknown> | null> {
    const config =
      this.configService.get<Record<string, unknown>>("frontendConfig") || null;

    return config;
  }

  async getTheme(): Promise<Record<string, unknown> | null> {
    const theme =
      this.configService.get<Record<string, unknown>>("frontendTheme") || null;
    return theme;
  }

  async updateConfig(config: Record<string, unknown>): Promise<void> {
    console.log("Updating config to:", config);
    // Implement the actual update logic here.
  }

  async getOrCreateAppConfig(): Promise<AppConfigDocument> {
    const existing = await this.appConfigModel
      .findOne({ _id: "frontend" }) // TODO: use id from param
      .lean();

    if (!existing) {
      const defaultConfig =
        this.configService.get<Record<string, unknown>>("frontendConfig") || {};

      const created = await this.appConfigModel.create({
        _id: "frontend",
        value: defaultConfig,
      });
      return created.toObject();
    }

    return existing;
  }
}
