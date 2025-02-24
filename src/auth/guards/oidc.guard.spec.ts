import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import configuration, { type OidcConfig } from "src/config/configuration";
import { OidcAuthGuard } from "./oidc.guard";
import { ExecutionContext } from "@nestjs/common";
import { Request } from "express";

const config: Partial<ReturnType<typeof configuration>> = {
  oidc: {
    frontendClients: ["scicat"],
    clientConfig: {
      scicat: {},
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
    expect(mockRequest.session.returnURL).toBe("/datasets123");
  });

  it("should set default client if client is not provided in query", () => {
    const mockRequest: Request = {
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

  it("should set successURL from referer header if OIDC_SUCCESS_URL config is unset", () => {
    const mockRequest: Request = {
      query: {},
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
