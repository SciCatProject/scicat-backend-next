import { Controller, Get, Headers, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Action } from "src/casl/action.enum";
import { AppAbility } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { UserIdentity } from "./schemas/user-identity.schema";
import { UserIdentitiesService } from "./user-identities.service";

@ApiBearerAuth()
@ApiTags("user identities")
@Controller("useridentities")
export class UserIdentitiesController {
  constructor(private userIdentitiesService: UserIdentitiesService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, UserIdentity),
  )
  @Get("/findOne")
  async findOne(
    @Headers() headers: Record<string, string>,
  ): Promise<UserIdentity | null> {
    console.log({ headers });
    let filter = {};
    if (headers.filter) {
      const parsedFilter = JSON.parse(headers.filter);
      if (parsedFilter.where) {
        filter = parsedFilter.where;
      }
    }
    return this.userIdentitiesService.findOne(filter);
  }
}
