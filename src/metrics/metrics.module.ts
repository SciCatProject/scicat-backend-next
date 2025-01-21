import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AccessTrackingMiddleware } from "./middlewares/accessTracking.middleware";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [ConfigModule, JwtModule],
  exports: [],
})
export class MetricsModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const { include = [], exclude = [] } =
      this.configService.get("metrics.config") || {};
    if (!include.length && !exclude.length) {
      Logger.error(
        'Metrics middleware requires at least one "include" or "exclude" path in the metricsConfig.json file.',
        "MetricsModule",
      );
      return;
    }

    try {
      consumer
        .apply(AccessTrackingMiddleware)
        .exclude(...exclude)
        .forRoutes(...include);
      Logger.log("Start collecting metrics", "MetricsModule");
    } catch (error) {
      Logger.error("Error configuring metrics middleware", error);
    }
  }
}
