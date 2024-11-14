import {
  Injectable,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MetricsService } from "../metrics.service";

@Injectable()
export class MetricsTrackInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const requestPath = request.path.toLowerCase();
    // Check if the route matches, e.g., "/datasets/"

    // TODO: MUST: It will match any path after datasets/
    // Implement with cautious
    if (requestPath.includes("/datasets/")) {
      return next.handle().pipe(
        map((data) => {
          if (response.statusCode === 200) {
            this.metricsService.incrementViewCount(data.pid, data.isPublished);
          }

          return data;
        }),
      );
    }

    // Proceed with the request normally if route doesn't match
    return next.handle();
  }
}
