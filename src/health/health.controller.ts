import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from "@nestjs/terminus";
import { AllowAny } from "src/auth/decorators/allow-any.decorator";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @AllowAny()
  @Get()
  @HealthCheck()
  check() {
    // Here you can add various health checks, e.g., for database, queues, etc.
    // For HTTP health checks, use the `http.pingCheck` function.
    return this.health.check([
      // The readiness endpoint verifies that the application is running and can connect to required services
      async () =>
        this.http.pingCheck("http", "http://localhost:3000/api/v3/datasets"),
    ]);
  }
}
