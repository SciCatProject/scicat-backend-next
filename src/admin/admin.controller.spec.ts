import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";

class AdminServiceMock {}

describe("PoliciesController", () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useClass: AdminServiceMock }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
