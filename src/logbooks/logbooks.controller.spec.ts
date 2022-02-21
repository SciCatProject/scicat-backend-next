import { Test, TestingModule } from "@nestjs/testing";
import { LogbooksController } from "./logbooks.controller";
import { LogbooksService } from "./logbooks.service";

describe("LogbooksController", () => {
  let controller: LogbooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogbooksController],
      providers: [LogbooksService],
    }).compile();

    controller = module.get<LogbooksController>(LogbooksController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
