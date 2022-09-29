import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { DatasetsService } from "src/datasets/datasets.service";

@Injectable()
export class HistoryInterceptor implements NestInterceptor {
  constructor(
    @Inject(DatasetsService) readonly datasetsService: DatasetsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    await this.datasetsService.keepHistory(req);
    return next.handle();
  }
}
