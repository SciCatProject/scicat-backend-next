import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import config from "../config/frontend.config.json";

const mockConfig: Record<string, unknown> = config;

describe("PoliciesService", () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken("Policy"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockConfig),
            constructor: jest.fn().mockResolvedValue(mockConfig),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        AdminService,
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
