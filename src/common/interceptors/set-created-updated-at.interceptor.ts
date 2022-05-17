import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class SetCreatedUpdatedAtInterceptor<T> implements NestInterceptor {
  propName: keyof T;

  constructor(propName: keyof T) {
    this.propName = propName;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    req.body[this.propName] = new Date().toISOString() as keyof T;

    return next.handle();
  }
}
