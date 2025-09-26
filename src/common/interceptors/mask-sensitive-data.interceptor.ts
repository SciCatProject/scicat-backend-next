import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Module,
  NestInterceptor,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { isEmail } from "class-validator";
import { from, map, mergeMap, Observable } from "rxjs";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { AccessGroupsType } from "src/config/configuration";
import { UserIdentitiesService } from "src/users/user-identities.service";
import { UsersModule } from "src/users/users.module";

@Injectable()
class MaskSensitiveDataInterceptor implements NestInterceptor {
  adminGroups: string[] | undefined;

  constructor(
    private readonly configService: ConfigService,
    private userIdentitiesService: UserIdentitiesService,
  ) {
    this.adminGroups =
      this.configService.get<AccessGroupsType>("accessGroups")?.admin;
  }

  private maskSensitiveData<T>(
    data: T,
    ownEmails: Set<string>,
    seen = new WeakSet(),
  ): T {
    if (seen.has(data as object)) return data;
    if (!this.isPlainObject(data) && !Array.isArray(data)) return data;
    if (Array.isArray(data)) {
      const maskedData = data.map((item) => {
        if (this.isToMaskEmail(item, ownEmails)) {
          return this.maskValue();
        }
        return this.maskSensitiveData(item, ownEmails, seen);
      });
      data.length = 0;
      data.push(...new Set(maskedData));
      return data;
    }

    seen.add(data as object);
    for (const [key, value] of Object.entries(data as object)) {
      if (this.isToMaskEmail(value, ownEmails)) {
        (data as Record<string, unknown>)[key] = this.maskValue();
        continue;
      }
      this.maskSensitiveData(value, ownEmails, seen);
    }
    return data;
  }

  private isPlainObject<T>(input: T): boolean {
    return typeof input === "object" && input !== null;
  }

  private isToMaskEmail(value: string | unknown, ownEmails: Set<string>) {
    return typeof value === "string" && isEmail(value) && !ownEmails.has(value);
  }

  private maskValue(): string {
    return "*****";
  }

  private async getIdentityEmails(
    user: JWTUser | undefined,
  ): Promise<Set<string>> {
    const emails: Set<string> = new Set();
    if (!user?.email) return emails;
    emails.add(user.email);
    const userIdentity = await this.userIdentitiesService.findOne({
      userId: user._id,
    });
    if (userIdentity?.profile?.email) emails.add(userIdentity.profile.email);
    userIdentity?.profile.emails?.forEach((e) => emails.add(e.value));
    return emails;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (
      user?.currentGroups?.some((group: string) =>
        this.adminGroups?.includes(group),
      )
    )
      return next.handle();

    return from(this.getIdentityEmails(user)).pipe(
      mergeMap((emails) =>
        next.handle().pipe(map((data) => this.maskSensitiveData(data, emails))),
      ),
    );
  }
}

@Module({
  imports: [UsersModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: MaskSensitiveDataInterceptor },
  ],
})
export class MaskSensitiveDataInterceptorModule {}
