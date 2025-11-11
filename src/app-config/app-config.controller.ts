import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppConfigService } from "./app-config.service";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";

@ApiTags("app-config")
@Controller("app-config")
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @AllowAny()
  @Get("config")
  async getConfig(): Promise<Record<string, unknown> | null> {
    return this.appConfigService.getConfig();
  }

  @Put("config")
  async updateConfig(@Body() config: Record<string, unknown>): Promise<void> {
    await this.appConfigService.updateConfig(config);
  }
}
