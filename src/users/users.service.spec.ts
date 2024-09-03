import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { RolesService } from "./roles.service";
import { UserIdentity } from "./schemas/user-identity.schema";
import { User } from "./schemas/user.schema";
import { UsersService } from "./users.service";
import { JwtService } from "@nestjs/jwt";
import { UserSettings } from "./schemas/user-settings.schema";
import { AccessGroupService } from "src/auth/access-group-provider/access-group.service";
import { AccessGroupFromStaticValuesService } from "src/auth/access-group-provider/access-group-from-static-values.service";

class RolesServiceMock {}
class JwtServiceMock {}

const mockUser: User = {
  _id: "testId",
  realm: "test",
  username: "testUser",
  password: "testPassword",
  email: "test@email.com",
  emailVerified: true,
  authStrategy: "local",
  userSettings: {
    _id: "testId",
    id: "testId",
    columns: [],
    datasetCount: 25,
    jobCount: 25,
    userId: "testUserId",
    filters: [
      { type: "LocationFilterComponent", visible: true },
      { type: "PidFilterComponent", visible: true },
      { type: "PidFilterContainsComponent", visible: false },
      { type: "PidFilterStartsWithComponent", visible: false },
      { type: "GroupFilterComponent", visible: true },
      { type: "TypeFilterComponent", visible: true },
      { type: "KeywordFilterComponent", visible: true },
      { type: "DateRangeFilterComponent", visible: true },
      { type: "TextFilterComponent", visible: true },
    ],
    conditions: [],
  },
};

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

const mockUserSettings: UserSettings = {
  _id: "testId",
  id: "testId",
  columns: [],
  datasetCount: 25,
  jobCount: 25,
  userId: "testUserId",
  filters: [
    { type: "LocationFilterComponent", visible: true },
    { type: "PidFilterComponent", visible: true },
    { type: "PidFilterContainsComponent", visible: false },
    { type: "PidFilterStartsWithComponent", visible: false },
    { type: "GroupFilterComponent", visible: true },
    { type: "TypeFilterComponent", visible: true },
    { type: "KeywordFilterComponent", visible: true },
    { type: "DateRangeFilterComponent", visible: true },
    { type: "TextFilterComponent", visible: true },
  ],
  conditions: [],
};

describe("UsersService", () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userModel: Model<User>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userIdentityModel: Model<UserIdentity>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userSettingsModel: Model<UserSettings>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        { provide: RolesService, useClass: RolesServiceMock },
        { provide: JwtService, useClass: JwtServiceMock },
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
        {
          provide: getModelToken("UserSettings"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUserSettings),
            constructor: jest.fn().mockResolvedValue(mockUserSettings),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        UsersService,
        {
          provide: AccessGroupService,
          useValue: () =>
            new AccessGroupFromStaticValuesService(["AAA", "BBB"]),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken("User"));
    userIdentityModel = module.get<Model<UserIdentity>>(
      getModelToken("UserIdentity"),
    );
    userSettingsModel = module.get<Model<UserSettings>>(
      getModelToken("UserSettings"),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
