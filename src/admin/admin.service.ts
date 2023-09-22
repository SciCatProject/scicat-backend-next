import {Injectable} from "@nestjs/common";
import config from "../config/frontend.config.json";
import theme from "../config/frontend.theme.json";

@Injectable()
export class AdminService {
  async getConfig(): Promise<Record<string, unknown> | null> {
    return config;
  }

  async getTheme(): Promise<Record<string, unknown> | null> {
    return theme;
  }
}
