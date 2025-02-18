import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import configuration, { type OidcConfig } from "src/config/configuration";
import { Response } from "express";
import { Session } from "express-session";

class AuthServiceMock {
  login() {
    return {
      username: "Test User",
      email: "testUser@gmail.com",
      access_token: "xyz",
      userId: "abc",
    };
  }

  adLogin() {
    return { username: "Test User", email: "testUser@gmail.com" };
  }

  whoami() {
    return { username: "Test User", email: "testUser@gmail.com" };
  }
}

const config: Partial<ReturnType<typeof configuration>> = {
  oidc: {
    frontendClients: ["scicat"],
    clientConfig: {
      scicat: {
        successURL: "https://scicatbackend.com/",
      },
      maxiv: {}, //simulate unset config
    },
  } as unknown as OidcConfig,
};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService(config),
        },
        { provide: AuthService, useClass: AuthServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should redirect to successURL for the client from config", async () => {
    const mockResponse: Response = {
      req: {
        session: {
          client: "scicat",
          returnURL: "/datasets123",
        } as unknown as Session,
      },
      redirect: jest.fn<void, [string]>(),
    } as unknown as Response;

    await controller.loginCallback(mockResponse);

    expect(mockResponse.redirect).toBeCalled();
    const redirectedUrl = (
      mockResponse.redirect as unknown as jest.Mock<void, [string]>
    ).mock.calls[0][0];
    console.log("redirectedURL is", redirectedUrl);
    const url = new URL(redirectedUrl);
    expect(url.origin).toEqual<string>(
      new URL(config.oidc!.clientConfig["scicat"].successURL as string).origin,
    );
    expect(url.searchParams.get("access-token")).toEqual<string>("xyz");
    expect(url.searchParams.get("user-id")).toEqual<string>("abc");
    expect(url.searchParams.get("returnUrl")).toEqual<string>("/datasets123");
  });

  it("should redirect to successURL from session if config is unset", async () => {
    const mockResponse: Response = {
      req: {
        session: {
          client: "maxiv",
          successURL: "https://custom-scicat-frontend.com/",
        } as unknown as Session,
      },
      redirect: jest.fn<void, [string]>(),
    } as unknown as Response;

    await controller.loginCallback(mockResponse);

    expect(mockResponse.redirect).toBeCalled();
    const redirectedUrl = (
      mockResponse.redirect as unknown as jest.Mock<void, [string]>
    ).mock.calls[0][0];
    const url = new URL(redirectedUrl);
    expect(url.origin).toEqual<string>(
      new URL("https://custom-scicat-frontend.com/").origin,
    );
    expect(url.searchParams.get("access-token")).toEqual<string>("xyz");
    expect(url.searchParams.get("user-id")).toEqual<string>("abc");
    // Default returnUrl since returnUrl config is also unset
    expect(url.searchParams.get("returnUrl")).toEqual<string>("/datasets");
  });
});
