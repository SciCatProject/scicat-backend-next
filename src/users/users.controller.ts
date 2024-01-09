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
  Body,
  ForbiddenException,
  HttpCode,
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
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { JwtSignOptions } from "@nestjs/jwt";
import { CreateCustomJwt } from "./dto/create-custom-jwt.dto";
import { AuthenticatedPoliciesGuard } from "../casl/guards/auth-check.guard";

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

    const ability = this.caslAbilityFactory.createForUser(authenticatedUser);
    // const authorized = actions.map( action =>
    //   ability.can(action, viewedUserSchema)
    // ) as Array<Boolean>;

    if (!actions.some((action) => ability.can(action, viewedUserSchema))) {
      throw new ForbiddenException("Access Forbidden or Unauthorized");
    }
  }

  @Post("jwt")
  @ApiOperation({
    summary: "It creates a new jwt token.",
    description:
      "It creates a new jwt token. It will be anonymous if no user is logged in.",
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

  @UseGuards(AuthenticatedPoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) => ability.can(Action.UserReadOwn, User),
  )
  @UseInterceptors(CreateUserSettingsInterceptor)
  @Get("/my/self")
  async getMyUser(
    @Req() request: Request,
  ): Promise<Omit<User, "password"> | null> {
    const authenticatedUserId: string = (request.user as JWTUser)._id
    await this.checkUserAuthorization(
      request,
      [Action.UserReadOwn],
      (request.user as JWTUser)._id
    );
    return this.usersService.findById(authenticatedUserId);
  }

  @UseGuards(AuthenticatedPoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) => ability.can(Action.UserReadOwn, User),
  )
  @Get("/my/identity")
  async getMyUserIdentity(
    @Req() request: Request,
  ): Promise<UserIdentity | null> {
    const authenticatedUserId: string = (request.user as JWTUser)._id
    await this.checkUserAuthorization(
      request,
      [Action.UserReadOwn],
      authenticatedUserId
    );
    return this.usersService.findByIdUserIdentity(authenticatedUserId);
  }

  @UseGuards(AuthenticatedPoliciesGuard)
  @CheckPolicies(
    (ability: AppAbility) => ability.can(Action.UserReadOwn, User),
  )
  @Get("/my/settings")
  async getMySettings(
    @Req() request: Request,
  ): Promise<UserSettings | null> {
    const authenticatedUserId: string = (request.user as JWTUser)._id;
    await this.checkUserAuthorization(
      request,
      [Action.UserReadOwn],
      authenticatedUserId,
    );
    return this.usersService.findByIdUserSettings(authenticatedUserId);
  }

  @UseGuards(AuthenticatedPoliciesGuard)
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

  @UseGuards(AuthenticatedPoliciesGuard)
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

  @UseGuards(AuthenticatedPoliciesGuard)
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

  @UseGuards(AuthenticatedPoliciesGuard)
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

  @UseGuards(AuthenticatedPoliciesGuard)
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

  @UseGuards(AuthenticatedPoliciesGuard)
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

  @UseGuards(AuthenticatedPoliciesGuard)
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

  @UseGuards(AuthenticatedPoliciesGuard)
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
    const ability = this.caslAbilityFactory.createForUser(viewedUser);

    const canCreateDataset = ability.can(Action.DatasetCreate, DatasetClass);

    return {
      authorization: canCreateDataset,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "It logs the current user out.",
    description: "It logs out the current user.",
  })
  @ApiResponse({
    status: 200,
    description: "User logged out",
  })
  @HttpCode(200)
  @Post("logout")
  async logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @UseGuards(AuthenticatedPoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.UserCreateJwt, User),
  )
  @Post("/:id/jwt")
  @ApiOperation({
    summary: "It creates a new jwt token for the user specified.",
    description:
      "It creates a new jwt token for the user specified. Only users in admin groups can create use this endpoint. Token expiration can be custom. Use 'expiresIn: never' for tokens that have no expiration.",
  })
  @ApiBody({ type: CreateCustomJwt })
  @ApiResponse({
    status: 201,
    type: CreateUserJWT,
    description:
      "Create a new JWT token for specified user with custom properties",
  })
  async createCustomJWT(
    @Req() request: Request,
    @Param("id") id: string,
    @Body() jwtProperties: CreateCustomJwt,
  ): Promise<CreateUserJWT | null> {
    const viewedUser = (await this.usersService.findById(id)) as Omit<
      User,
      "password"
    >;

    if (viewedUser) {
      return this.usersService.createCustomJWT(
        JSON.parse(JSON.stringify(viewedUser)),
        jwtProperties as JwtSignOptions,
      );
    }
    return null;
  }
}
