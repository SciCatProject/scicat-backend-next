import { Test, TestingModule } from "@nestjs/testing";
import { CaslModule } from "src/casl/casl.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

class UsersServiceMock {
  findByIdUserIdentity(id: string) {
    return { id };
  }
}

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      imports: [CaslModule],
      providers: [{ provide: UsersService, useClass: UsersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
