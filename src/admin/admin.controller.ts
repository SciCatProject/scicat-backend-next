import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";

@ApiTags("admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @AllowAny()
  @Get("config")
  async getConfig(): Promise<Record<string, unknown>> {
    return this.adminService.getConfig();
  }

  @AllowAny()
  @Get("theme")
  async getTheme(): Promise<Record<string, unknown>> {
    return this.adminService.getTheme();
  }
}
