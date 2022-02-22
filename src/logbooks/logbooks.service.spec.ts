import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { LogbooksService } from "./logbooks.service";

class HttpServiceMock {}

describe("LogbooksService", () => {
  let service: LogbooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: HttpService, useClass: HttpServiceMock },
        LogbooksService,
      ],
    }).compile();

    service = module.get<LogbooksService>(LogbooksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
