import { Injectable } from "@nestjs/common";
import config from "../config/frontend.config";
import theme from "../config/frontend.theme";

@Injectable()
export class AdminService {
  async getConfig(): Promise<Record<string, unknown> | null> {
    return config;
  }

  async getTheme(): Promise<Record<string, unknown> | null> {
    return theme;
  }
}
