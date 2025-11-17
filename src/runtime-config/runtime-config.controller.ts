import { Body, Controller, Get, Param, Put, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { OutputRuntimeConfigDto } from "./dto/runtime-config.dto";
import { RuntimeConfigService } from "./runtime-config.service";

@ApiTags("runtime-config")
@Controller("runtime-config")
export class RuntimeConfigController {
  constructor(private readonly runtimeConfigService: RuntimeConfigService) {}

  @AllowAny()
  @Get("data")
  async getConfig(
    @Param("id") id: string,
  ): Promise<OutputRuntimeConfigDto | null> {
    return this.runtimeConfigService.getConfig(id);
  }

  @Put("data")
  async updateConfig(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() config: Record<string, unknown>,
  ): Promise<void> {
    const user: JWTUser = request.user as JWTUser;
    await this.runtimeConfigService.updateConfig(id, config, user.username);
  }
}
