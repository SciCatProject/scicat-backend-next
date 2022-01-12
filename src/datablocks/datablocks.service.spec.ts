import { Test, TestingModule } from "@nestjs/testing";
import { DatablocksService } from "./datablocks.service";

describe("DatablocksService", () => {
  let service: DatablocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatablocksService],
    }).compile();

    service = module.get<DatablocksService>(DatablocksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
