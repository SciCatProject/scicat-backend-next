import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { AccessLogsService } from "../access-logs/access-logs.service";
import { parse } from "url";

@Injectable()
export class MetricsAndLogsMiddleware implements NestMiddleware {
  private requestCache = new Map<string, number>(); // Cache to store recent requests
  private cacheDuration = 1000;

  constructor(
    private readonly jwtService: JwtService,
    private readonly accessLogsService: AccessLogsService,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    const { query, pathname } = parse(req.originalUrl, true);
    const userAgent = req.headers["user-agent"];
    // TODO: Better to use a library for this?
    const isBot = userAgent ? /bot|crawl|spider|slurp/i.test(userAgent) : false;

    if (!pathname || isBot) return;

    const startTime = Date.now();
    //TODO: Implment the logic for checking if this is human or bot
    const authHeader = req.headers.authorization;
    const originIp = req.socket.remoteAddress;
    const userId = this.parseToken(authHeader);

    const cacheKeyIdentifier = `${userId}-${originIp}-${pathname}`;

    res.on("finish", () => {
      const statusCode = res.statusCode;
      const responseTime = Date.now() - startTime;

      const lastHitTime = this.requestCache.get(cacheKeyIdentifier);

      // Log only if the request was not recently logged
      if (!lastHitTime || Date.now() - lastHitTime > this.cacheDuration) {
        this.accessLogsService.create({
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
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;

    try {
      const { id } = this.jwtService.decode(token);
      return id;
    } catch (error) {
      Logger.error("Error parsing token-> MetricsAndLogsMiddleware", error);
      return null;
    }
  }
}
