import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { updateTimesToUTC } from "../utils";

@Injectable()
export class UTCTimeInterceptor<T, K extends keyof T>
  implements NestInterceptor
{
  dateKeys: K[];

  constructor(dateKeys: K[]) {
    this.dateKeys = dateKeys;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const instance = req.body as T;

    updateTimesToUTC<T, keyof T>(this.dateKeys, instance);
    return next.handle();
  }
}
