import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Module,
  NestInterceptor,
} from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { isEmail } from "class-validator";
import { map, Observable } from "rxjs";

@Injectable()
class MaskSensitiveDataInterceptor implements NestInterceptor {
  private maskSensitiveData<T>(
    data: T,
    ownEmail: string,
    seen = new WeakSet(),
  ): T {
    if (seen.has(data as object)) return data;
    if (!this.isPlainObject(data) && !Array.isArray(data)) return data;
    if (Array.isArray(data)) {
      const maskedData = data.map((item) => {
        if (this.isToMaskEmail(item, ownEmail)) {
          return this.maskValue();
        }
        return this.maskSensitiveData(item, ownEmail, seen);
      });
      data.length = 0;
      data.push(...new Set(maskedData));
      return data;
    }

    seen.add(data as object);
    for (const [key, value] of Object.entries(data as object)) {
      if (this.isToMaskEmail(value, ownEmail)) {
        (data as Record<string, unknown>)[key] = this.maskValue();
        continue;
      }
      this.maskSensitiveData(value, ownEmail, seen);
    }
    return data;
  }

  private isPlainObject<T>(input: T): boolean {
    return typeof input === "object" && input !== null;
  }

  private isToMaskEmail(value: string | unknown, ownEmail: string) {
    return typeof value === "string" && isEmail(value) && value !== ownEmail;
  }

  private maskValue(): string {
    return "*****";
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const ownEmail = request.user?.email;
    return next.handle().pipe(
      map((data) => {
        return this.maskSensitiveData(data, ownEmail);
      }),
    );
  }
}

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: MaskSensitiveDataInterceptor },
  ],
})
export class MaskSensitiveDataInterceptorModule {}
