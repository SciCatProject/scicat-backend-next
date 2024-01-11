import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ScicatLogger } from "./logger.service";

class MockDefaultLogger {
  getLogger = jest.fn();
}

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(
    JSON.stringify([
      {
        type: "DefaultLogger",
        modulePath: "./loggingProviders/defaultLogger",
        config: {},
        methods: {},
      },
    ]),
  ),
}));

jest.mock("./loggingProviders/defaultLogger", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => new MockDefaultLogger()),
  };
});

describe("LoggerService", () => {
  let service: ScicatLogger;

  const mockConfigService = {
    get: jest.fn().mockImplementation(() => []),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScicatLogger,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    service = module.get<ScicatLogger>(ScicatLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should properly load CustomLogger", () => {
    expect(service).toBeDefined();
  });

  it("should call DefaultLogger", async () => {
    await service.onModuleInit();

    const MockedDefaultLogger = jest.requireMock(
      "./loggingProviders/defaultLogger",
    ).default;

    expect(MockedDefaultLogger).toHaveBeenCalledTimes(1);
  });
});
