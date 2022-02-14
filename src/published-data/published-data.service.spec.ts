import { Test, TestingModule } from "@nestjs/testing";
import { PublishedDataService } from "./published-data.service";

describe("PublishedDataService", () => {
  let service: PublishedDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishedDataService],
    }).compile();

    service = module.get<PublishedDataService>(PublishedDataService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
