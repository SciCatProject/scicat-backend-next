import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AdminService } from "./admin.service";
import config from "../config/frontend.config.json";
import theme from "../config/frontend.theme.json";

describe("AdminService", () => {
  let service: AdminService;
  const mockConfigService = {
    get: jest.fn((propertyPath: string) => {
      const config = {
        maxFileUploadSizeInMb: "12mb",
      } as Record<string, unknown>;

      return config[propertyPath];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getConfig", () => {
    it("should return modified config", async () => {
      const result = await service.getConfig();

      expect(result).toEqual({
        ...config,
        maxFileUploadSizeInMb: "12mb",
      });
    });
  });

  describe("getTheme", () => {
    it("should return theme config", async () => {
      const result = await service.getTheme();
      expect(result).toEqual(theme);
    });
  });
});
