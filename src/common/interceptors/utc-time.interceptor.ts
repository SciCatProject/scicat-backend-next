import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { updateTimesToUTC } from "../utils";

@Injectable()
export class UTCTimeInterceptor<T> implements NestInterceptor {
  dateKeys: (keyof T)[];

  constructor(dateKeys: (keyof T)[]) {
    this.dateKeys = dateKeys;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const instance = req.body as T;
    req.body = updateTimesToUTC<T>(this.dateKeys, instance);
    return next.handle();
  }
}
