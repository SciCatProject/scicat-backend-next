import { ConsoleLogger as LocalLogger } from "@nestjs/common";

export default class DefaultLogger {
  private logger: LocalLogger;
  constructor() {
    this.logger = new LocalLogger();
  }
  getLogger() {
    return this.logger;
  }
}
