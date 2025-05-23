import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectConnection } from "@nestjs/mongoose";
import MongoStore from "connect-mongo";
import { Request, Response, NextFunction, RequestHandler } from "express";
import session, { Store } from "express-session";
import { Connection } from "mongoose";

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly requestHandler: RequestHandler;
  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {
    let store: { store: Store } | object = {};
    if (this.configService.get<string>("expressSession.store") === "mongo")
      store = {
        store: MongoStore.create({
          client: this.mongoConnection.getClient(),
          ttl: this.configService.get<number>("jwt.expiresIn"),
        }),
      };
    this.requestHandler = session({
      secret: this.configService.get<string>("expressSession.secret") as string,
      resave: false,
      saveUninitialized: true,
      ...store,
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    return this.requestHandler(req, res, next);
  }
}
