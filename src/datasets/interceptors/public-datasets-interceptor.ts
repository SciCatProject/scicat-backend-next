import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class PublicDatasetsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const user = context.getArgs()[1].req.user;
    if (!user) {
      if (context.getArgs()[1].req.query.fields) {
        let fields = JSON.parse(context.getArgs()[1].req.query.fields);
        fields = { ...fields, isPublished: true };
        context.getArgs()[1].req.query.fields = JSON.stringify(fields);
      } else {
        context.getArgs()[1].req.query.fields = JSON.stringify({
          isPublished: true,
        });
      }
    }
    return next.handle();
  }
}
