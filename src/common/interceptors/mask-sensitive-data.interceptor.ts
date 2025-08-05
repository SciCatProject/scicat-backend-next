import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Module,
  NestInterceptor,
} from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { instanceToPlain } from "class-transformer";
import { isEmail } from "class-validator";
import { map, Observable } from "rxjs";

@Injectable()
class MaskSensitiveDataInterceptor implements NestInterceptor {
  private maskSensitiveData<T>(data: T, ownEmail: string): T {
    if (Array.isArray(data)) {
      let allArrays = true;
      const maskedData = data.map((item) => {
        if (this.isToMaskEmail(item, ownEmail)) {
          return this.maskValue();
        }
        allArrays = false;
        return this.maskSensitiveData(item, ownEmail);
      });
      return ((allArrays && [...new Set(maskedData)]) || maskedData) as T;
    }

    if (!this.isPlainObject(data)) return data as T;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.isToMaskEmail(value, ownEmail)) {
        result[key] = this.maskValue();
        continue;
      }
      result[key] = this.maskSensitiveData(value, ownEmail);
    }
    return result as T;
  }

  private isPlainObject(input: unknown): input is Record<string, unknown> {
    return (
      typeof input === "object" &&
      input !== null &&
      !Array.isArray(input) &&
      Object.getPrototypeOf(input) === Object.prototype
    );
  }

  private isToMaskEmail(value: string | unknown, ownEmail: string) {
    return typeof value === "string" && isEmail(value) && value !== ownEmail;
  }

  private maskValue(): string {
    return "*****";
  }

  private toPlain<T extends { toObject?: () => object }>(value: T): T {
    if (Array.isArray(value)) {
      return value.map(this.toPlain) as unknown as T;
    }

    if (value && typeof value === "object") {
      if (typeof value.toObject === "function") {
        return value.toObject() as T;
      }

      try {
        return instanceToPlain(value) as T;
      } catch {
        return value;
      }
    }

    return value;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const ownEmail = request.user?.email;
    return next.handle().pipe(
      map((data) => {
        const plainData = this.toPlain(data);
        return this.maskSensitiveData(plainData, ownEmail);
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
