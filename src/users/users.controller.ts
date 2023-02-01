import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Patch,
  Delete,
  UseInterceptors,
  Put,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
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
import { UserSettings } from "./schemas/user-settings.schema";
import { CreateUserSettingsDto } from "./dto/create-user-settings.dto";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";
import { User } from "./schemas/user.schema";
import { CreateUserSettingsInterceptor } from "./interceptors/create-user-settings.interceptor";
import { AuthService } from "src/auth/auth.service";
import { CredentialsDto } from "src/auth/dto/credentials.dto";
import { LocalAuthGuard } from "src/auth/guards/local-auth.guard";

@ApiBearerAuth()
@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @AllowAny()
  @Post("jwt")
  async getUserJWT(@Req() request: Request): Promise<CreateUserJWT | null> {
    return this.usersService.createUserJWT(request.user as JWTUser);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, User))
  @UseInterceptors(CreateUserSettingsInterceptor)
  @Get("/:id")
  async findById(
    @Param("id") id: string,
  ): Promise<Omit<User, "password"> | null> {
    return this.usersService.findById(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, UserIdentity),
  )
  @Get(":id/userIdentity")
  async getUserIdentity(@Param("id") id: string): Promise<UserIdentity | null> {
    return this.usersService.findByIdUserIdentity(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, UserSettings),
  )
  @Post("/:id/settings")
  async createSettings(
    @Param("id") id: string,
    createUserSettingsDto: CreateUserSettingsDto,
  ): Promise<UserSettings> {
    return this.usersService.createUserSettings(id, createUserSettingsDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, UserSettings),
  )
  @Get("/:id/settings")
  async getSettings(@Param("id") id: string): Promise<UserSettings | null> {
    return this.usersService.findByIdUserSettings(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, UserSettings),
  )
  @Put("/:id/settings")
  async updateSettings(
    @Param("id") userId: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings | null> {
    return this.usersService.findOneAndUpdateUserSettings(
      userId,
      updateUserSettingsDto,
    );
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, UserSettings),
  )
  @Patch("/:id/settings")
  async patchSettings(
    @Param("id") userId: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings | null> {
    return this.usersService.findOneAndUpdateUserSettings(
      userId,
      updateUserSettingsDto,
    );
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, UserSettings),
  )
  @Delete("/:id/settings")
  async removeSettings(@Param("id") userId: string): Promise<unknown> {
    return this.usersService.findOneAndRemoveUserSettings(userId);
  }
}
