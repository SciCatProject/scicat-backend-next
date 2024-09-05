import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, switchMap } from "rxjs";
import { CreateUserSettingsDto } from "../dto/create-user-settings.dto";
import { UsersService } from "../users.service";
import {
  FilterComponentType,
  UserSettings,
} from "../schemas/user-settings.schema";
import { UpdateUserSettingsDto } from "../dto/update-user-settings.dto";

@Injectable()
export class UserSettingsInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse();
    const user = res.req.user;

    if (!user) {
      return next.handle();
    }

    const userId = user._id;

    return next.handle().pipe(
      switchMap(async (payload) => {
        const userSettings =
          await this.usersService.findByIdUserSettings(userId);

        if (!userSettings) {
          Logger.log(
            `Adding default settings to user ${user.username}`,
            "UserSettingsInterceptor",
          );
          const createUserSettingsDto: CreateUserSettingsDto = {
            userId,
            filters: [],
            conditions: [],
            columns: [],
          };
          await this.usersService.createUserSettings(
            userId,
            createUserSettingsDto,
          );
        } else {
          const isValidFilters = this.isValidFilterComponentType(userSettings);

          if (!isValidFilters) {
            Logger.log(
              `Reset default settings to user ${user.username}`,
              "UserSettingsInterceptor",
            );
            await this.resetUserSettings(userId, userSettings);
          }
        }
        return payload;
      }),
    );
  }
  private async resetUserSettings(userId: string, userSettings: UserSettings) {
    // NOTE: The extra functions ensure filters in user setting record match the FilterComponentType format.
    // If not, reset the user settings to maintain consistency.
    const updateUserSettingsDto: UpdateUserSettingsDto = {
      ...userSettings,
      filters: [],
    };
    const updatedUsersFilter =
      await this.usersService.findOneAndUpdateUserSettings(
        userId,
        updateUserSettingsDto,
      );
    return updatedUsersFilter;
  }

  private isValidFilterComponentType(userSettings: UserSettings): boolean {
    if (userSettings.filters.length === 0) {
      return true;
    }
    return userSettings.filters.every((filter) => {
      const [key, value] = Object.entries(filter)[0];
      return (
        Object.keys(FilterComponentType).includes(key) &&
        typeof value === "boolean"
      );
    });
  }
}
