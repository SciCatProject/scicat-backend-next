import { Test, TestingModule } from "@nestjs/testing";
import { AccessGroupFromGraphQLApiService } from "./access-group-from-graphql-api-call.service";

describe("AccessGroupProviderService", () => {
  let service: AccessGroupFromGraphQLApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessGroupFromGraphQLApiService],
    }).compile();

    service = module.get<AccessGroupFromGraphQLApiService>(
      AccessGroupFromGraphQLApiService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
