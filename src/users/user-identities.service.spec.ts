import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { UserIdentity } from "./schemas/user-identity.schema";
import { UserIdentitiesService } from "./user-identities.service";

const mockUserIdentity: UserIdentity = {
  authStrategy: "test",
  created: new Date(),
  credentials: {},
  externalId: "testExternalId",
  modified: new Date(),
  profile: {
    id: "testProfileId",
    displayName: "Test User",
    email: "test@email.com",
    username: "testUser",
    thumbnailPhoto: "testPhoto",
    emails: [],
    accessGroups: ["test"],
  },
  provider: "test",
  userId: "testId",
};

describe("UserIdentitiesService", () => {
  let service: UserIdentitiesService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userIdentityModel: Model<UserIdentity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserIdentitiesService,
        {
          provide: getModelToken("UserIdentity"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUserIdentity),
            constructor: jest.fn().mockResolvedValue(mockUserIdentity),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserIdentitiesService>(UserIdentitiesService);
    userIdentityModel = module.get<Model<UserIdentity>>(
      getModelToken("UserIdentity"),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
