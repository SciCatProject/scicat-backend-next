import { Global, Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { RequestContextMiddleware } from "../middleware/request-context.middleware";
import { UserContextService } from "../services/user-context.service";

@Global()
@Module({
  providers: [UserContextService],
  exports: [UserContextService],
})
export class RequestContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
