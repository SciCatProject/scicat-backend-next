import {Test, TestingModule} from "@nestjs/testing";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {ConfigService} from "@nestjs/config";

class AuthServiceMock {
  login(req: Record<string, unknown>) {
    return {username: "Test User", email: "testUser@gmail.com"};
  }

  adLogin(req: Record<string, unknown>) {
    return {username: "Test User", email: "testUser@gmail.com"};
  }

  whoami(req: Record<string, unknown>) {
    return {username: "Test User", email: "testUser@gmail.com"};
  }
}

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        ConfigService,
        {provide: AuthService, useClass: AuthServiceMock},
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
