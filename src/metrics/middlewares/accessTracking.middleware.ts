import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { parse } from "url";

@Injectable()
export class AccessTrackingMiddleware implements NestMiddleware {
  private requestCache = new Map<string, number>(); // Cache to store recent requests
  private logIntervalDuration = 1000; // Log every 1 second to prevent spam
  private cacheResetInterval = 10 * 60 * 1000; // Clear cache every 10 minutes to prevent memory leak

  constructor(private readonly jwtService: JwtService) {
    this.startCacheResetInterval();
  }
  use(req: Request, res: Response, next: NextFunction) {
    const { query, pathname } = parse(req.originalUrl, true);

    const userAgent = req.headers["user-agent"];
    // TODO: Better to use a library for this?
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
    if (!authHeader) return "anonymous";
    const token = authHeader.split(" ")[1];
    if (!token) return "anonymous";

    try {
      const { id } = this.jwtService.decode(token);
      return id;
    } catch (error) {
      Logger.error("Error parsing token-> AccessTrackingMiddleware", error);
      return null;
    }
  }

  private startCacheResetInterval() {
    setInterval(() => {
      this.requestCache.clear();
    }, this.cacheResetInterval);
  }
}
