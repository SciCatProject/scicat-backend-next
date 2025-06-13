import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { setCurrentRequest } from "../utils/request-context.util";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Set the current request in the AsyncLocalStorage
    setCurrentRequest(req);

    // Call the next middleware or route handler
    next();
  }
}
