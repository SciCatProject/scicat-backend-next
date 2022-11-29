import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { appendSIUnitToPhysicalQuantity } from "../utils";

@Injectable()
export class FormatPhysicalQuantitiesInterceptor<T> implements NestInterceptor {
  propName: keyof T;

  constructor(propName: keyof T) {
    this.propName = propName;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const instance: unknown = (req.body as T)[this.propName];

    if (req.body[this.propName]) {
      req.body[this.propName] = appendSIUnitToPhysicalQuantity(
        instance as object,
      );
    }

    return next.handle();
  }
}
