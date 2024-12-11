import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { MetricsController } from "../metrics.controller";

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly metricsController: MetricsController,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers["user-agent"];
    const authHeader = req.headers.authorization;
    const ip = req.ip || req.socket.remoteAddress;
    const user = this.parseToken(authHeader);
    const endpoint = req.originalUrl;
    const startTime = Date.now();

    res.on("finish", () => {
      const statusCode = res.statusCode;
      const responseTime = Date.now() - startTime;

      this.metricsController.logMetrics(
        user,
        ip,
        userAgent,
        endpoint,
        statusCode,
        responseTime,
      );
    });

    next();
  }

  private parseToken(authHeader?: string) {
    try {
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const { id, username } = this.jwtService.decode(token);
        // TODO: changes it to return userid before merge;
        return username;
        // return id;
      }
      return null;
    } catch (error) {
      Logger.error("Error parsing token-> MetricsMiddleware", error);
      return null;
    }
  }
}
