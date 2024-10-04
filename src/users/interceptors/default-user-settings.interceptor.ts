import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";
import { UsersService } from "../users.service";
import { FILTER_CONFIGS } from "../schemas/user-settings.schema";
import { UpdateUserSettingsDto } from "../dto/update-user-settings.dto";

@Injectable()
export class DefaultUserSettingsInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    return next.handle().pipe(
      map(async () => {
        Logger.log("DefaultUserSettingsInterceptor");
        const defaultUserSettings: UpdateUserSettingsDto = {
          columns: [],
          filters: FILTER_CONFIGS,
          conditions: [],
        };
        console.log(defaultUserSettings);
        return defaultUserSettings;
      }),
    );
  }
}
