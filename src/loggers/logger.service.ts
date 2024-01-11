/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger, LoggerConfig } from "./interfaces/logger.interface";
import * as fs from "fs";

@Injectable()
export class ScicatLogger implements OnModuleInit {
  private loggers: {
    logger: Logger;
    methods?: Record<string, unknown>;
  }[] = [];
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    let loggerConfigs = this.configService.get<LoggerConfig[]>("loggerConfigs");

    const filePath = "loggers.json";
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      loggerConfigs = JSON.parse(data);
    }

    if (!loggerConfigs || loggerConfigs.length < 1) {
      console.log('No logger configs found in "loggers.json"');
    } else {
      await Promise.all(
        loggerConfigs.map(async (loggerConfig) => {
          try {
            const LoggerClass = await import(loggerConfig.modulePath);
            const logger = new LoggerClass.default(loggerConfig.config);

            this.loggers.push({
              logger: logger.getLogger(),
              methods: loggerConfig.methods,
            });
          } catch (err) {
            console.error(err);
          }
        }),
      );
    }
  }

  private handleLogForwarding(method: string, ...args: unknown[]): void {
    for (const { logger, methods } of this.loggers as any) {
      let targetMethod = method;

      if (methods && Object.keys(methods).length > 0 && methods[method]) {
        targetMethod = methods[method];
      }

      try {
        if (logger[targetMethod]) {
          logger[targetMethod](...args);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  log(message: string, context?: Record<string, unknown> | string) {
    this.handleLogForwarding("log", message, context);
  }

  error(
    message: string,
    trace?: string,
    context?: Record<string, unknown> | string,
  ): void {
    this.handleLogForwarding("error", message, context, trace);
  }

  warn(message: string, context?: Record<string, unknown> | string): void {
    this.handleLogForwarding("warn", message, context);
  }

  debug(message: string, context?: Record<string, unknown> | string) {
    this.handleLogForwarding("debug", message, context);
  }

  exception(
    message: string,
    exception: unknown,
    context?: Record<string, unknown>,
  ) {
    this.handleLogForwarding("exception", message, exception, context);
  }
}
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: ScicatLogger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    this.logger.exception(JSON.stringify(message), exception, {
      requestUrl: request.url,
      requestUser: request.user,
      statusCode: status,
    });
    response.status(status).json(message);
  }
}
