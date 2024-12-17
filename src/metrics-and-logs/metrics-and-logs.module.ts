import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MetricsModule } from "./metrics/metrics.module";
import { AccessLogsModule } from "./access-logs/access-logs.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MetricsAndLogsMiddleware } from "./middlewares/metrics-and-logs.middleware";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [MetricsModule, AccessLogsModule, ConfigModule, JwtModule],
  exports: [MetricsModule, AccessLogsModule],
})
export class MetricsAndLogsModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const { include = [], exclude = [] } =
      this.configService.get("metricsConfig") || {};

    try {
      consumer
        .apply(MetricsAndLogsMiddleware)
        .exclude(...exclude)
        .forRoutes(...include);
      Logger.log("Start collecting metrics", "MetricsModule");
    } catch (error) {
      Logger.error("Error configuring metrics middleware", error);
    }
  }
}
