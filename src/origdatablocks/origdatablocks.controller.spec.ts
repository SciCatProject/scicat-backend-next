import { Test, TestingModule } from "@nestjs/testing";
import { OrigdatablocksController } from "./origdatablocks.controller";
import { OrigdatablocksService } from "./origdatablocks.service";

describe("OrigdatablocksController", () => {
  let controller: OrigdatablocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigdatablocksController],
      providers: [OrigdatablocksService],
    }).compile();

    controller = module.get<OrigdatablocksController>(OrigdatablocksController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
