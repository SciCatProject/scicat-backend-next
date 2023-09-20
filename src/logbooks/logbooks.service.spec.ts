import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";
import { LogbooksService } from "./logbooks.service";

class HttpServiceMock {
  get() {
    const responseData = [{ messages: [] }, { messages: [] }];

    // Create an object that mimics the structure of an HTTP response
    const response = {
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
    };
    return of(response);
  }
}

describe("LogbooksService", () => {
  let service: LogbooksService;
  const filters = JSON.stringify({
    textSearch: "",
    showBotMessages: true,
    showUserMessages: true,
    showImages: true,
  });
  const configureService = (logbook: boolean) => {
    service["logbookEnabled"] = logbook;
  };

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

  it("[LogBooks-1]should be defined", () => {
    expect(service).toBeDefined();
  });

  it("[LogBooks-2]logbook services should not return null if loogbook is enabled ", async () => {
    configureService(true);

    const findAllResult = await service.findAll();
    expect(findAllResult).not.toEqual(null);

    const findByNameResult = await service.findByName("111111", filters);
    expect(findByNameResult).not.toEqual(null);
  });

  it("[LogBooks-3]logbook services should return null or [] if logbook is not enabled", async () => {
    configureService(false);

    const findAllResult = await service.findAll();
    expect(findAllResult).toEqual([]);

    const findByNameResult = await service.findByName("111111", filters);
    expect(findByNameResult).toEqual(null);
  });
});
