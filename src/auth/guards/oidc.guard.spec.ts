import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import configuration, { type OidcConfig } from "src/config/configuration";
import { OidcAuthGuard } from "./oidc.guard";
import { ExecutionContext, HttpException } from "@nestjs/common";
import { Request } from "express";

const config: Partial<ReturnType<typeof configuration>> = {
  oidc: {
    frontendClients: ["scicat", "scilog", "maxiv"],
    clientConfig: {
      scicat: {
        successURL: "https://scicat-frontend.com/",
        returnURL: "/datasets",
      },
      scilog: {
        successURL: "https://scilog-frontend.com/",
      },
      maxiv: {},
    },
  } as unknown as OidcConfig,
};

describe("OidcAuthGuard", () => {
  let oidcAuthGuard: OidcAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcAuthGuard,
        {
          provide: ConfigService,
          useValue: new ConfigService(config),
        },
      ],
    }).compile();

    oidcAuthGuard = module.get(OidcAuthGuard);
  });

  it("should be defined", () => {
    expect(oidcAuthGuard).toBeDefined();
  });

  it("should validate and store request params in session", () => {
    const mockRequest: Request = {
      path: "/api/v3/auth/oidc",
      query: { client: "scicat", returnURL: "/datasets123" },
      session: {}, // Initially empty session
      headers: {},
    } as unknown as Request;
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    oidcAuthGuard.getRequest(mockExecutionContext);

    expect(mockRequest.session.client).toBe("scicat");

    // prefers returnURL from query params over config
    expect(mockRequest.session.returnURL).toBe("/datasets123");
  });

  it("should set default client if client is not provided in query", () => {
    const mockRequest: Request = {
      path: "/api/v3/auth/oidc",
      query: { returnURL: "/datasets123" },
      session: {}, // Initially empty session
      headers: {},
    } as unknown as Request;
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    oidcAuthGuard.getRequest(mockExecutionContext);

    expect(mockRequest.session.client).toBe("scicat");
  });

  it("should throw exception if client is unknown", () => {
    const mockRequest: Request = {
      path: "/api/v3/auth/oidc",
      query: { client: "unregistered_client" },
      session: {}, // Initially empty session
      headers: {},
    } as unknown as Request;
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
    expect(() => oidcAuthGuard.getRequest(mockExecutionContext)).toThrow(
      HttpException,
    );
  });

  it("should set proper successURL in session for the default client", () => {
    const mockRequest: Request = {
      path: "/api/v3/auth/oidc",
      query: {},
      session: {}, // Initially empty session
      headers: {},
    } as unknown as Request;
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    oidcAuthGuard.getRequest(mockExecutionContext);

    expect(mockRequest.session.successURL).toBe("https://scicat-frontend.com/");
  });

  it("should set proper successURL in session for the non-default client", () => {
    const mockRequest: Request = {
      path: "/api/v3/auth/oidc",
      query: { client: "scilog" },
      session: {}, // Initially empty session
      headers: {},
    } as unknown as Request;
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    oidcAuthGuard.getRequest(mockExecutionContext);

    expect(mockRequest.session.successURL).toBe("https://scilog-frontend.com/");
  });

  it("should set successURL from referer header if OIDC_${CLIENT}_SUCCESS_URL config is unset", () => {
    const mockRequest: Request = {
      path: "/api/v3/auth/oidc",
      query: { client: "maxiv" },
      session: {}, // Initially empty session
      headers: { referer: "https//custom-scicat-frontend.com" },
    } as unknown as Request;
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    oidcAuthGuard.getRequest(mockExecutionContext);

    expect(mockRequest.session.successURL).toBe(
      "https//custom-scicat-frontend.com",
    );
  });
});
