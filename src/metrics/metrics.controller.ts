import { Controller } from "@nestjs/common";

@Controller("metrics")
export class MetricsController {
  constructor() {}
  logMetrics(
    user: string | null,
    ip: string | undefined,
    userAgent: string | undefined,
    endpoint: string,
    statusCode: number,
    responseTime: number,
  ) {
    console.log(
      `User ID: ${user}, IP: ${ip}, User-Agent: ${userAgent}, Endpoint: ${endpoint}, Status Code: ${statusCode}, Response Time: ${responseTime}ms`,
    );
  }
}
