import { Test, TestingModule } from "@nestjs/testing";
import { SamplesService } from "./samples.service";

describe("SamplesService", () => {
  let service: SamplesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SamplesService],
    }).compile();

    service = module.get<SamplesService>(SamplesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
