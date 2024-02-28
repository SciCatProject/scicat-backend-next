import { ConsoleLogger as LocalLogger } from "@nestjs/common";
import { Logger } from "../interfaces/logger.interface";

export default class DefaultLogger implements Logger {
  private logger: LocalLogger;
  constructor() {
    this.logger = new LocalLogger();
  }
  log(message: string, context: Record<string, unknown>): void {
    this.logger.log(message, context ?? "");
  }
  error(message: string, context: Record<string, unknown>): void {
    this.logger.error(message, context ?? "");
  }
  warn(message: string, context: Record<string, unknown>): void {
    this.logger.warn(message, context ?? "");
  }
  debug(message: string, context: Record<string, unknown>): void {
    this.logger.debug(message, context ?? "");
  }
  exception(
    message: string,
    exception: unknown,
    context: Record<string, unknown>,
  ): void {
    this.logger.error(message, exception, context ?? "");
  }
}
