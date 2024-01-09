import {
  Injectable,
  ConsoleLogger,
  Logger,
  LoggerService,
} from "@nestjs/common";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { GrayLogLogger, setLogger } from "@user-office-software/duo-logger";

enum LEVEL {
  INFO = "info",
  ERROR = "error",
  WARN = "warn",
  DEBUG = "debug",
  EXCEPTION = "exception",
}
@Injectable()
export class CustomLogger extends ConsoleLogger implements LoggerService {
  private grayLogger: GrayLogLogger | null = null;
  private server: string;
  private port: string;
  private env: string;
  private service: string;
  private facility: string;
  private grayLogEnabled: boolean;
  private grayLogLevels: string[];
  constructor(private readonly configService: ConfigService) {
    super();
    this.facility = this.configService.get<string>("grayLog.facility") || "";
    this.server = this.configService.get<string>("grayLog.server") || "";
    this.port = this.configService.get<string>("grayLog.port") || "";
    this.env = this.configService.get<string>("nodeEnv") || "unset";
    this.service = this.configService.get<string>("grayLog.service") || "unset";
    this.grayLogEnabled =
      this.configService.get<boolean>("grayLog.enabled") || false;
    this.grayLogLevels =
      this.configService.get<[string]>("grayLog.levels") || [];

    if (this.grayLogEnabled) {
      if (!this.server || !this.port || !this.facility) {
        Logger.error(
          "GrayLogger is enabled but facility/server/port environment variable is not configured",
          "GrayLogger",
        );
      } else {
        this.grayLogger = new GrayLogLogger(
          this.server,
          parseInt(this.port),
          {
            facility: this.facility,
            environment: this.env,
            service: this.service,
          },
          [],
        );
        setLogger(this.grayLogger);
        super.log(
          `Enabled GrayLogger levels: ${this.grayLogLevels}`,
          "GrayLogger",
        );
      }
    }
  }
  log(message: string, context?: Record<string, unknown> | string) {
    if (this.grayLogger && this.grayLogLevels.includes(LEVEL.INFO)) {
      this.grayLogger.logInfo(message, { context });
    }
    super.log(message, context);
  }

  error(
    message: string,
    trace?: string,
    context?: Record<string, unknown> | string,
  ) {
    if (this.grayLogger && this.grayLogLevels.includes(LEVEL.ERROR)) {
      this.grayLogger.logError(message, { trace, context });
    }
    super.error(message, trace, context);
  }

  warn(message: string, context?: Record<string, unknown> | string) {
    if (this.grayLogger) {
      this.grayLogger.logWarn(message, { context });
    }
    super.warn(message, context);
  }

  debug(message: string, context?: Record<string, unknown> | string) {
    if (this.grayLogger && this.grayLogLevels.includes(LEVEL.DEBUG)) {
      this.grayLogger.logDebug(message, { context });
    }
    super.debug(message, context);
  }

  exception(
    message: string,
    exception: unknown,
    context?: Record<string, unknown>,
  ) {
    if (this.grayLogger && this.grayLogLevels.includes(LEVEL.EXCEPTION)) {
      this.grayLogger.logException(message, exception, context);
    }
  }
}
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}
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
