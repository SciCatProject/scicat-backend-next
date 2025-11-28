import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { OutputRuntimeConfigDto } from "./dto/runtime-config.dto";
import { RuntimeConfigService } from "./runtime-config.service";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { Action } from "src/casl/action.enum";
import { AppAbility } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { RuntimeConfig } from "./schemas/runtime-config.schema";
@ApiBearerAuth()
@ApiTags("runtime-config")
@Controller("runtime-config")
export class RuntimeConfigController {
  constructor(private readonly runtimeConfigService: RuntimeConfigService) {}

  @AllowAny()
  @Get("data/:id")
  async getConfig(
    @Param("id") id: string,
  ): Promise<OutputRuntimeConfigDto | null> {
    const config = await this.runtimeConfigService.getConfig(id);

    return config;
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies("runtimeconfig", (ability: AppAbility) =>
    ability.can(Action.Update, RuntimeConfig),
  )
  @Put("data/:id")
  @ApiBody({
    type: Object,
    description: "Runtime config object",
  })
  async updateConfig(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() config: Record<string, unknown>,
  ): Promise<OutputRuntimeConfigDto | null> {
    const user: JWTUser = request.user as JWTUser;
    return await this.runtimeConfigService.updateConfig(
      id,
      config,
      user.username,
    );
  }
}
