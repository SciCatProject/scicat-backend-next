import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class RegisteredInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const user = context.getArgs()[1].req.user;
    if (!user) {
      if (context.getArgs()[1].req.query.fields) {
        let fields = JSON.parse(context.getArgs()[1].req.query.fields);
        fields = { ...fields, status: "registered" };
        context.getArgs()[1].req.query.fields = JSON.stringify(fields);
      } else {
        context.getArgs()[1].req.query.fields = JSON.stringify({
          status: "registered",
        });
      }
    }
    return next.handle();
  }
}
