import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MetricsMiddleware } from "./middlewares/metrics.middleware";
import { JwtModule } from "@nestjs/jwt";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Metrics, MetricsSchema } from "./schemas/metrics.schema";
import { AccessLogs, AccessLogSchema } from "./schemas/access-log.schema";

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    MongooseModule.forFeature([
      {
        name: Metrics.name,
        schema: MetricsSchema,
      },
      {
        name: AccessLogs.name,
        schema: AccessLogSchema,
      },
    ]),
  ],
  providers: [MetricsService, MetricsController],
  exports: [],
})
export class MetricsModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const { include = [], exclude = [] } =
      this.configService.get("metricsConfig") || {};

    try {
      consumer
        .apply(MetricsMiddleware)
        .exclude(...exclude)
        .forRoutes(...include);
      Logger.log("Start collecting metrics", "MetricsModule");
    } catch (error) {
      Logger.error("Error configuring metrics middleware", error);
    }
  }
}
