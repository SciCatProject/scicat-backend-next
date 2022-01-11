import { Test, TestingModule } from "@nestjs/testing";
import { OrigdatablocksService } from "./origdatablocks.service";

describe("OrigdatablocksService", () => {
  let service: OrigdatablocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrigdatablocksService],
    }).compile();

    service = module.get<OrigdatablocksService>(OrigdatablocksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
