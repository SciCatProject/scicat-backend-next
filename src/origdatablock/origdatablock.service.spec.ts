import { Test, TestingModule } from "@nestjs/testing";
import { OrigdatablockService } from "./origdatablock.service";

describe("OrigdatablockService", () => {
  let service: OrigdatablockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrigdatablockService],
    }).compile();

    service = module.get<OrigdatablockService>(OrigdatablockService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
