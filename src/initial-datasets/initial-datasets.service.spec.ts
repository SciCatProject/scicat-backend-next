import { Test, TestingModule } from "@nestjs/testing";
import { InitialDatasetsService } from "./initial-datasets.service";

describe("InitialDatasetsService", () => {
  let service: InitialDatasetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitialDatasetsService],
    }).compile();

    service = module.get<InitialDatasetsService>(InitialDatasetsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
