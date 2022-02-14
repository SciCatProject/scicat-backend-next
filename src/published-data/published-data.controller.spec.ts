import { Test, TestingModule } from "@nestjs/testing";
import { PublishedDataController } from "./published-data.controller";
import { PublishedDataService } from "./published-data.service";

describe("PublishedDataController", () => {
  let controller: PublishedDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishedDataController],
      providers: [PublishedDataService],
    }).compile();

    controller = module.get<PublishedDataController>(PublishedDataController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
