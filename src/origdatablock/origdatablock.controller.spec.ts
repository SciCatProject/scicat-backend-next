import { Test, TestingModule } from "@nestjs/testing";
import { OrigdatablockController } from "./origdatablock.controller";
import { OrigdatablockService } from "./origdatablock.service";

describe("OrigdatablockController", () => {
  let controller: OrigdatablockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigdatablockController],
      providers: [OrigdatablockService],
    }).compile();

    controller = module.get<OrigdatablockController>(OrigdatablockController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
