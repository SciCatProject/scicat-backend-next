import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { CreateUserSettingsDto } from "../dto/create-user-settings.dto";
import { UsersService } from "../users.service";
import { FILTER_CONFIGS } from "../schemas/user-settings.schema";

@Injectable()
export class CreateUserSettingsInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    return next.handle().pipe(
      tap(async () => {
        const res = context.switchToHttp().getResponse();
        const user = res.req.user;
        if (!user) {
          return;
        }
        const userId = user._id;
        const userSettings =
          await this.usersService.findByIdUserSettings(userId);
        if (!userSettings) {
          Logger.log(
            `Adding default settings to user ${user.username}`,
            "CreateUserSettingsInterceptor",
          );
          const createUserSettingsDto: CreateUserSettingsDto = {
            userId,
            columns: [],
            filters: FILTER_CONFIGS,
            conditions: [],
          };
          return this.usersService.createUserSettings(
            userId,
            createUserSettingsDto,
          );
        }
        return;
      }),
    );
  }
}
