import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Action } from "src/casl/action.enum";
import { AppAbility } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { UserIdentity } from "./schemas/user-identity.schema";
import { UsersService } from "./users.service";

@ApiBearerAuth()
@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, UserIdentity),
  )
  @Get(":id/userIdentity")
  async getUserIdentity(@Param("id") id: string): Promise<UserIdentity | null> {
    return await this.usersService.findByIdUserIdentity(id);
  }
}
