import { Test, TestingModule } from "@nestjs/testing";
import { AccessGroupFromApiCallService } from "./access-group-from-api-call.service";

describe("AccessGroupProviderService", () => {
  let service: AccessGroupFromApiCallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessGroupFromApiCallService],
    }).compile();

    service = module.get<AccessGroupFromApiCallService>(
      AccessGroupFromApiCallService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
