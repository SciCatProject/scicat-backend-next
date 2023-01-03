import { Controller, Get, Headers, Query, UseGuards } from "@nestjs/common";
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
    // NOTE: This now supports both headers filter and query filter.
    // There is a loopback config file where we have this as a setting on the frontend.
    // In the future if we fully migrate to the new backend we can only support query filters.
    @Headers() headers: Record<string, string>,
    @Query("filter") queryFilters?: string,
  ): Promise<UserIdentity | null> {
    const parsedQueryFilters = JSON.parse(queryFilters ?? "{}");
    let filter = {};
    if (headers.filter) {
      const parsedFilter = JSON.parse(headers.filter);
      if (parsedFilter.where) {
        filter = parsedFilter.where;
      }
    } else if (parsedQueryFilters.where) {
      filter = parsedQueryFilters.where;
    }
    return this.userIdentitiesService.findOne(filter);
  }
}
