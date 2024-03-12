import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { RolesService } from "./roles.service";
import { Role } from "./schemas/role.schema";
import { UserRole } from "./schemas/user-role.schema";

const mockRole: Role = {
  _id: "testId",
  name: "testRole",
  created: new Date(),
  modified: new Date(),
};

const mockUserRole: UserRole = {
  userId: "testUserId",
  roleId: "testRoleId",
};

describe("RolesService", () => {
  let service: RolesService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let roleModel: Model<Role>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRoleModel: Model<UserRole>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken("Role"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockRole),
            constructor: jest.fn().mockResolvedValue(mockRole),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken("UserRole"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUserRole),
            constructor: jest.fn().mockResolvedValue(mockUserRole),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleModel = module.get<Model<Role>>(getModelToken("Role"));
    userRoleModel = module.get<Model<UserRole>>(getModelToken("UserRole"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
