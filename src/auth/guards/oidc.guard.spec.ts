import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import configuration, { type OidcConfig } from "src/config/configuration";
import { OidcAuthGuard } from "./oidc.guard";
import { ExecutionContext } from "@nestjs/common";
import { Request } from "express";

const config: Partial<ReturnType<typeof configuration>> = {
  oidc: {
    frontendClients: ["scicat"],
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
});
