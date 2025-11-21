import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AdminService {
  constructor(private configService: ConfigService) {}

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
}
