import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { parse } from "url";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AccessTrackingMiddleware implements NestMiddleware {
  private requestCache = new Map<string, number>(); // Cache to store recent requests
  private logIntervalDuration = 1000; // Log every 1 second to prevent spam
  private cacheResetInterval = 10 * 60 * 1000; // Clear cache every 10 minutes to prevent memory leak
  private jwtSecret: string | undefined;

  constructor(
    private readonly jwtService: JwtService,
    private readonly confgiService: ConfigService,
  ) {
    this.startCacheResetInterval();
    this.jwtSecret = this.confgiService.get<string>("jwt.secret");
  }
  use(req: Request, res: Response, next: NextFunction) {
    const { query, pathname } = parse(req.originalUrl, true);

    const userAgent = req.headers["user-agent"];

    const isBot = userAgent ? /bot|crawl|spider|slurp/i.test(userAgent) : false;

    if (!pathname || isBot) return;

    const startTime = Date.now();
    const authHeader = req.headers.authorization;
    const originIp = req.socket.remoteAddress;
    const userId = this.parseToken(authHeader);

    const cacheKeyIdentifier = `${userId}-${originIp}-${pathname}`;

    res.on("finish", () => {
      const statusCode = res.statusCode;
      if (statusCode === 304) return;

      const responseTime = Date.now() - startTime;

      const lastHitTime = this.requestCache.get(cacheKeyIdentifier);

      // Log only if the request was not recently logged
      if (!lastHitTime || Date.now() - lastHitTime > this.logIntervalDuration) {
        Logger.log("SciCatAccessLogs", {
          userId,
          originIp,
          endpoint: pathname,
          query: query,
          statusCode,
          responseTime,
        });

        this.requestCache.set(cacheKeyIdentifier, Date.now());
      }
    });

    next();
  }

  private parseToken(authHeader?: string) {
    if (!authHeader || !authHeader.split(" ")[1]) {
      return "anonymous";
    }

    const rawToken = authHeader.split(" ")[1];

    try {
      const verifiedToken = this.jwtService.verify(rawToken, {
        secret: this.jwtSecret,
      });

      return verifiedToken.id;
    } catch (error) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        return "anonymous";
      }

      Logger.error("Error parsing token-> AccessTrackingMiddleware", error);
      return "anonymous";
    }
  }

  private startCacheResetInterval() {
    setInterval(() => {
      this.requestCache.clear();
    }, this.cacheResetInterval);
  }
}
