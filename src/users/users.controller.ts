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
  //UnauthorizedException,
  Body,
  Res,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Action } from "src/casl/action.enum";
import { AppAbility, CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { UserIdentity } from "./schemas/user-identity.schema";
import { UsersService } from "./users.service";
import { CreateUserJWT } from "./dto/create-user-jwt.dto";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";
import { Request, Response } from "express";
import { JWTUser } from "../auth/interfaces/jwt-user.interface";
import { UserSettings } from "./schemas/user-settings.schema";
import { CreateUserSettingsDto } from "./dto/create-user-settings.dto";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";
import { User } from "./schemas/user.schema";
import { CreateUserSettingsInterceptor } from "./interceptors/create-user-settings.interceptor";
import { AuthService } from "src/auth/auth.service";
import { CredentialsDto } from "src/auth/dto/credentials.dto";
import { LocalAuthGuard } from "src/auth/guards/local-auth.guard";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
//import { AuthController } from "src/auth/auth.controller";

@ApiBearerAuth()
@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async checkUserAuthorization(
    request: Request,
    actions: Action[],
    viewedUserId: string,
  ) {
    const authenticatedUser: JWTUser = request.user as JWTUser;
    const viewedUserSchema = new User();
    viewedUserSchema._id = viewedUserId;
    viewedUserSchema.id = viewedUserId;

    const ability = await this.caslAbilityFactory.createForUser(
      authenticatedUser,
    );
    // const authorized = actions.map( action =>
    //   ability.can(action, viewedUserSchema)
    // ) as Array<Boolean>;
    if (!actions.some((action) => ability.can(action, viewedUserSchema))) {
      throw new ForbiddenException("Access Forbidden or Unauthorized");
    }
  }

  @AllowAny()
  @Post("jwt")
  @ApiOperation({
    summary:
      "It creates a new jwt token or return the current one for logged in users.",
    description:
      "It creates a new jwt token or return the current one for logged in users.",
  })
  @ApiResponse({
    status: 201,
    type: CreateUserJWT,
    description:
      "Create a new JWT token for anonymous or the user that is currently logged in",
  })
  async getUserJWT(@Req() request: Request): Promise<CreateUserJWT | null> {
    return this.usersService.createUserJWT(request.user as JWTUser);
  }

  @ApiBody({ type: CredentialsDto })
  @AllowAny()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Req() req: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return await this.authService.login(req.user as Omit<User, "password">);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(Action.UserReadOwn, User) ||
      ability.can(Action.UserReadAny, User),
  )
  @UseInterceptors(CreateUserSettingsInterceptor)
  @Get("/:id")
  async findById(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<Omit<User, "password"> | null> {
    await this.checkUserAuthorization(
      request,
      [Action.UserReadAny, Action.UserReadOwn],
      id,
    );
    return this.usersService.findById(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(Action.UserReadOwn, User) ||
      ability.can(Action.UserReadAny, User),
  )
  @Get(":id/userIdentity")
  async getUserIdentity(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<UserIdentity | null> {
    await this.checkUserAuthorization(
      request,
      [Action.UserReadAny, Action.UserReadOwn],
      id,
    );
    return this.usersService.findByIdUserIdentity(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(Action.UserCreateOwn, User) ||
      ability.can(Action.UserCreateAny, User),
  )
  @Post("/:id/settings")
  async createSettings(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() createUserSettingsDto: CreateUserSettingsDto,
  ): Promise<UserSettings> {
    await this.checkUserAuthorization(
      request,
      [Action.UserCreateAny, Action.UserCreateOwn],
      id,
    );
    return this.usersService.createUserSettings(id, createUserSettingsDto);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(Action.UserReadOwn, User) ||
      ability.can(Action.UserReadAny, User),
  )
  @Get("/:id/settings")
  async getSettings(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<UserSettings | null> {
    await this.checkUserAuthorization(
      request,
      [Action.UserReadAny, Action.UserReadOwn],
      id,
    );
    return this.usersService.findByIdUserSettings(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(Action.UserUpdateOwn, User) ||
      ability.can(Action.UserUpdateAny, User),
  )
  @Put("/:id/settings")
  async updateSettings(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings | null> {
    await this.checkUserAuthorization(
      request,
      [Action.UserUpdateAny, Action.UserUpdateOwn],
      id,
    );
    return this.usersService.findOneAndUpdateUserSettings(
      id,
      updateUserSettingsDto,
    );
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(Action.UserUpdateOwn, User) ||
      ability.can(Action.UserUpdateAny, User),
  )
  @Patch("/:id/settings")
  async patchSettings(
    @Req() request: Request,
    @Param("id") id: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings | null> {
    await this.checkUserAuthorization(
      request,
      [Action.UserUpdateAny, Action.UserUpdateOwn],
      id,
    );
    return this.usersService.findOneAndUpdateUserSettings(
      id,
      updateUserSettingsDto,
    );
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(Action.UserDeleteOwn, User) ||
      ability.can(Action.UserDeleteAny, User),
  )
  @Delete("/:id/settings")
  async removeSettings(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<unknown> {
    await this.checkUserAuthorization(
      request,
      [Action.UserUpdateAny, Action.UserUpdateOwn],
      id,
    );
    return this.usersService.findOneAndRemoveUserSettings(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => {
    return (
      ability.can(Action.UserReadOwn, User) ||
      ability.can(Action.UserReadAny, User)
    );
  })
  @Get("/:id/authorization/dataset/create")
  async canUserCreateDataset(
    @Req() request: Request,
    @Param("id") id: string,
  ): Promise<unknown> {
    await this.checkUserAuthorization(
      request,
      [Action.UserReadAny, Action.UserReadOwn],
      id,
    );
    const viewedUser = (await this.usersService.findById2JWTUser(
      id,
    )) as JWTUser;
    const ability = await this.caslAbilityFactory.createForUser(viewedUser);

    return { authorization: ability.can(Action.Create, DatasetClass) };
  }

  @UseGuards(JwtAuthGuard)
  @Get("logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    return await this.authService.logout(req, res);
  }
}
