import { Injectable } from "@nestjs/common";
import config from "../config/frontend.config.json";
import theme from "../config/frontend.theme.json";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AdminService {
  constructor(private configService: ConfigService) {}

  async getConfig(): Promise<Record<string, unknown> | null> {
    const modifiedConfig = this.applyBackendConfigAdjustments();

    return modifiedConfig;
  }

  async getTheme(): Promise<Record<string, unknown> | null> {
    return theme;
  }

  // NOTE: Adjusts backend config values for frontend use (e.g., file upload limits).
  // Add future backend-dependent adjustments here as needed.
  private applyBackendConfigAdjustments(): Record<string, unknown> {
    const postEncodedMaxFileUploadSize =
      this.configService.get<string>("maxFileUploadSizeInMb") || "16mb";

    return {
      ...config,
      maxFileUploadSizeInMb: postEncodedMaxFileUploadSize,
    };
  }
}
