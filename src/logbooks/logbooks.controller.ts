import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { LogbooksService } from "./logbooks.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Logbook } from "./schemas/logbook.schema";
import { UsersLogbooksInterceptor } from "./interceptors/users-logbooks.interceptor";

@ApiBearerAuth()
@ApiTags("logbooks")
@Controller("logbooks")
export class LogbooksController {
  constructor(private readonly logbooksService: LogbooksService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Logbook))
  @UseInterceptors(UsersLogbooksInterceptor)
  @Get()
  findAll() {
    return this.logbooksService.findAll();
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Logbook))
  @UseInterceptors(UsersLogbooksInterceptor)
  @Get("/:name")
  async findByName(
    @Param("name") name: string,
    @Query("filters") filters: string,
  ): Promise<Logbook | null> {
    return this.logbooksService.findByName(name, filters);
  }
}
