import { Injectable, ConsoleLogger, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GrayLogLogger, setLogger } from "@user-office-software/duo-logger";

@Injectable()
export class GrayLogger extends ConsoleLogger {
  private server: string;
  private port: string;
  private env: string;
  private grayLogEnabled: boolean;
  constructor(private readonly configService: ConfigService) {
    super();
    this.server = this.configService.get<string>("grayLog.server") || "";
    this.port = this.configService.get<string>("grayLog.port") || "";
    this.env = this.configService.get<string>("nodeEnv") || "unset";
    this.grayLogEnabled =
      this.configService.get<boolean>("grayLog.enabled") || false;
    if (this.grayLogEnabled) {
      if (!this.server || !this.port) {
        Logger.error(
          "GrayLogger is enabled but server/port environment variable is not configured",
          "GrayLogger Initilazation failed",
        );
      } else {
        setLogger(
          new GrayLogLogger(
            this.server,
            parseInt(this.port),
            {
              facility: "DMSC",
              environment: this.env,
              service: "scicat-backend-next",
            },
            [],
          ),
        );
      }
    }
  }
}
