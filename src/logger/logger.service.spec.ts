jest.mock("@user-office-software/duo-logger", () => ({
  setLogger: jest.fn(),
  GrayLogLogger: jest.fn(),
}));

import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";

import { setLogger, GrayLogLogger } from "@user-office-software/duo-logger";
import { GrayLogger } from "./logger.service";

describe("LoggerService", () => {
  let service: GrayLogger;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case "grayLog.server":
          return "fake-server";
        case "grayLog.port":
          return 1234;
        case "grayLog.enabled":
          return true;
        case "nodeEnv":
          return "fake";
        case "grayLog.facility":
          return "fake";
        case "grayLog.service":
          return "test-service";
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrayLogger,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    service = module.get<GrayLogger>(GrayLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should properly load GrayLogger", () => {
    expect(service).toBeDefined();
  });

  it("should call the 'setLogger' correctly", () => {
    expect(setLogger).toHaveBeenCalledTimes(1);

    expect(GrayLogLogger).toHaveBeenCalledWith(
      "fake-server",
      1234,
      { facility: "fake", environment: "fake", service: "test-service" },
      [],
    );
  });
});
