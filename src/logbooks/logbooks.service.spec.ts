import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";
import { LogbooksService } from "./logbooks.service";

class HttpServiceMock {
  get() {
    const responseData = [{ messages: [] }, { messages: [] }];

    // Create an object that mimics the structure of an HTTP response
    const response = {
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
    };
    return of(response);
  }
}

describe("LogbooksService", () => {
  let service: LogbooksService;
  const username = "test-username";
  const password = "test-password";
  const configureService = (
    accessToken: string | null,
    username: "test-username",
    password: "test-password",
  ) => {
    service["logbookEnabled"] = true;
    service["username"] = username;
    service["password"] = password;
    service["accessToken"] = accessToken;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: HttpService, useClass: HttpServiceMock },
        LogbooksService,
      ],
    }).compile();

    service = module.get<LogbooksService>(LogbooksService);
  });

  it("[LogBooks-1]should be defined", () => {
    expect(service).toBeDefined();
  });

  it("[LogBooks-2]should fetch access token if accessToken is null", async () => {
    configureService(null, username, password);
    const loginSpy = jest.spyOn(service, "login");
    loginSpy.mockResolvedValue(Promise.resolve({ token: "token" }));

    const shouldRenewTokenSpy = jest.spyOn(service, "shouldRenewToken");
    shouldRenewTokenSpy.mockResolvedValue(false);

    await service.findAll();
    expect(loginSpy).toHaveBeenCalledWith(username, password);
  });

  it("[LogBooks-3]should not fetch access token if accessToken is not null & shouldRenewToken is false", async () => {
    configureService("token", username, password);
    const loginSpy = jest.spyOn(service, "login");

    const shouldRenewTokenSpy = jest.spyOn(service, "shouldRenewToken");
    shouldRenewTokenSpy.mockResolvedValue(false);

    await service.findAll();
    expect(loginSpy).toHaveBeenCalledTimes(0);
  });

  it("[LogBooks-4]should re-fetch access token even accessToken is not null, if shouldRenewToken is true", async () => {
    configureService("test", username, password);
    const shouldRenewTokenSpy = jest.spyOn(service, "shouldRenewToken");
    shouldRenewTokenSpy.mockResolvedValue(true);

    const loginSpy = jest.spyOn(service, "login");
    loginSpy.mockResolvedValue(Promise.resolve({ token: "token" }));

    await service.findAll();
    expect(loginSpy).toHaveBeenCalledWith(username, password);
  });
});
