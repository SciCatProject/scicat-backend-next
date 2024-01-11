import { setLogger, GrayLogLogger } from "@user-office-software/duo-logger";
import { GrayLoggerConfig } from "../interfaces/grayLoggerConfig.interface";

export default class GrayLogger {
  private logger: GrayLogLogger;
  constructor(config: GrayLoggerConfig) {
    this.logger = new GrayLogLogger(
      config.server,
      config.port,
      {
        facility: config.facility,
        environment: config.environment,
        service: config.service,
      },
      [],
    );
    setLogger(this.logger);
  }
  getLogger() {
    return this.logger;
  }
}
