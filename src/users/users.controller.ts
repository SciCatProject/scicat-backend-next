import { Controller, Get, Post, Param, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Action } from "src/casl/action.enum";
import { AppAbility } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { UserIdentity } from "./schemas/user-identity.schema";
import { UsersService } from "./users.service";
import { CreateUserJWT } from "./dto/create-user-jwt.dto";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { Request } from "express";
import { JWTUser } from "../auth/interfaces/jwt-user.interface";

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

  @AllowAny()
  @Post("jwt")
  async getUserJWT(@Req() request: Request): Promise<CreateUserJWT | null> {
    return await this.usersService.createUserJWT(request.user as JWTUser);
  }
}
