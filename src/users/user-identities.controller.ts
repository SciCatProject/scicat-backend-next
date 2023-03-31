import { Controller, ForbiddenException, Get, Headers, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Action } from "src/casl/action.enum";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { UserIdentity } from "./schemas/user-identity.schema";
import { UserIdentitiesService } from "./user-identities.service";
import { Request, Response } from "express";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { User } from "./schemas/user.schema";

@ApiBearerAuth()
@ApiTags("user identities")
@Controller("useridentities")
export class UserIdentitiesController {
  constructor(
    private userIdentitiesService: UserIdentitiesService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.UserReadOwn, User) || ability.can(Action.UserReadAny, User),
  )
  @Get("/findOne")
  async findOne(
    // NOTE: This now supports both headers filter and query filter.
    // There is a loopback config file where we have this as a setting on the frontend.
    // In the future if we fully migrate to the new backend we can only support query filters.
    @Headers() headers: Record<string, string>,
    @Req() request: Request,
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

    const authenticatedUser: JWTUser = request.user as JWTUser;
    const ability = await this.caslAbilityFactory.createForUser(
      authenticatedUser,
    );

    //console.log(ability.can(Action.UserReadAny, User));
    //console.log(ability.can(Action.UserReadOwn, User));
    if (!ability.can(Action.UserReadAny, User) && ability.can(Action.UserReadOwn, User)) {
      // this user can only see his/her user identity
      filter = {"userId": authenticatedUser._id, ...filter};
    }

    const identity = await this.userIdentitiesService.findOne(filter) as UserIdentity;

    const user = new User();
    user._id = identity.userId;
    user.id = identity.userId;
    if (!ability.can(Action.UserReadOwn, user) && !ability.can(Action.UserReadAny, User)) {
      throw new ForbiddenException("Access Forbidden or Unauthorized");
    }

    return identity;
  }
}
