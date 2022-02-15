import { Test, TestingModule } from "@nestjs/testing";
import { CaslModule } from "src/casl/casl.module";
import { PublishedDataController } from "./published-data.controller";
import { PublishedDataService } from "./published-data.service";

class PublishedDataServiceMock {}

describe("PublishedDataController", () => {
  let controller: PublishedDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishedDataController],
      imports: [CaslModule],
      providers: [
        { provide: PublishedDataService, useClass: PublishedDataServiceMock },
      ],
    }).compile();

    controller = module.get<PublishedDataController>(PublishedDataController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
