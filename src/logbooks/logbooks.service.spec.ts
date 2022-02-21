import { Test, TestingModule } from "@nestjs/testing";
import { LogbooksService } from "./logbooks.service";

describe("LogbooksService", () => {
  let service: LogbooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogbooksService],
    }).compile();

    service = module.get<LogbooksService>(LogbooksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
