import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AccessGroupFromPayloadService } from "./access-group-from-payload.service";

describe("AccessGroupFromPayloadService", () => {
  let service: AccessGroupFromPayloadService;

  const mockConfigService = {
    get: () => ({
      accessGroups: "accessGroups",
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessGroupFromPayloadService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<AccessGroupFromPayloadService>(
      AccessGroupFromPayloadService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("Should resolve access groups", async () => {
    const expected = ["AAA", "BBB"];
    const actual = await service.getAccessGroups({
      accessGroups: ["AAA", "BBB"],
    });
    expect(actual).toEqual(expected);
  });
});
