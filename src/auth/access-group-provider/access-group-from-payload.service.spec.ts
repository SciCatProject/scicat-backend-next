import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AccessGroupFromPayloadService } from "./access-group-from-payload.service";

describe("AccessGroupFromPayloadService", () => {
  let service: AccessGroupFromPayloadService;

  beforeEach(async () => {
    process.env.accessGroupsProperty = "accessGroups";

    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessGroupFromPayloadService, ConfigService],
    }).compile();

    service = module.get<AccessGroupFromPayloadService>(
      AccessGroupFromPayloadService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
