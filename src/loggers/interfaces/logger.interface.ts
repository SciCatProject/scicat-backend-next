export interface Logger {
  log(message: string, context: Record<string, unknown>): void;
  error(message: string, context: Record<string, unknown>): void;
  warn(message: string, context: Record<string, unknown>): void;
  debug(message: string, context: Record<string, unknown>): void;
  exception(
    message: string,
    exception: unknown,
    context: Record<string, unknown>,
  ): void;
}

export interface LoggerConfig {
  type: string;
  modulePath: string;
  config?: Record<string, unknown>;
}
