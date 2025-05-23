import { Test } from "@nestjs/testing";
import { SessionMiddleware } from "./session.middleware";
import { ConfigService } from "@nestjs/config";
import MongoStore from "connect-mongo";
import session from "express-session";
import { Request, Response } from "express";
import { getConnectionToken } from "@nestjs/mongoose";

jest.mock("express-session", () => {
  const actual = jest.requireActual("express-session");
  return {
    __esModule: true,
    ...actual,
    default: jest.fn(() => jest.fn()),
  };
});

[
  ["mongo", 1],
  ["other", 0],
].forEach(([store, callCount]) => {
  describe(`SessionMiddleware ${store}`, () => {
    let middleware: SessionMiddleware;
    let mongoStoreMock: jest.SpyInstance;
    let sessionMock: jest.Mock;
    let sessionHandlerMock: jest.Mock;

    beforeEach(async () => {
      mongoStoreMock = jest.spyOn(MongoStore, "create").mockReturnValue({
        client: "mockClient",
        ttl: 3600,
      } as unknown as MongoStore);

      sessionMock = session as unknown as jest.Mock;
      sessionHandlerMock = jest.fn();
      sessionMock.mockReturnValue(sessionHandlerMock);

      const configServiceMock = {
        get: jest.fn((key: string) => {
          switch (key) {
            case "expressSession.secret":
              return "secret";
            case "expressSession.store":
              return store;
            case "jwt.expiresIn":
              return 3600;
            default:
              return null;
          }
        }),
      };

      const mongoConnectionMock = {
        getClient: () => "mockClient",
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          SessionMiddleware,
          {
            provide: ConfigService,
            useValue: configServiceMock,
          },
          {
            provide: getConnectionToken(),
            useValue: mongoConnectionMock,
          },
        ],
      }).compile();

      middleware = moduleRef.get<SessionMiddleware>(SessionMiddleware);
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it("should be defined", () => {
      expect(middleware).toBeDefined();
    });

    it("should call MongoStore.create if store is mongo", () => {
      expect(mongoStoreMock).toHaveBeenCalledTimes(callCount as number);
      let store = {};
      const commonSessionOptions = {
        secret: "secret",
        resave: false,
        saveUninitialized: true,
      };
      if (callCount)
        store = {
          store: {
            client: "mockClient",
            ttl: 3600,
          },
        };
      expect(sessionMock).toHaveBeenCalledWith(
        Object.assign({}, commonSessionOptions, store),
      );
      if (!callCount) return;
      expect(mongoStoreMock).toHaveBeenCalledWith({
        client: "mockClient",
        ttl: 3600,
      });
    });

    it("should invoke session() with proper arguments", () => {
      const req = {} as Request;
      const res = {} as Response;
      const next = jest.fn();

      middleware.use(req, res, next);
      expect(sessionHandlerMock).toHaveBeenCalledWith(req, res, next);
    });
  });
});
