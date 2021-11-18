import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { RolesService } from "./roles.service";
import { UserIdentity } from "./schemas/user-identity.schema";
import { User } from "./schemas/user.schema";
import { UsersService } from "./users.service";

class RolesServiceMock {}

const mockUser: User = {
  _id: "testId",
  realm: "test",
  username: "testUser",
  password: "testPassword",
  email: "test@email.com",
  emailVerified: true,
};

const mockUserIdentity: UserIdentity = {
  authScheme: "test",
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

describe("UsersService", () => {
  let service: UsersService;
  let userModel: Model<User>;
  let userIdentityModel: Model<UserIdentity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        { provide: RolesService, useClass: RolesServiceMock },
        {
          provide: getModelToken("User"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
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
        UsersService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken("User"));
    userIdentityModel = module.get<Model<UserIdentity>>(
      getModelToken("UserIdentity"),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
