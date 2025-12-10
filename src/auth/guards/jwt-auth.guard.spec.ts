import { Test, TestingModule } from "@nestjs/testing";
import { RolesService } from "src/users/roles.service";
import { UsersService } from "src/users/users.service";
import { ConfigService } from "@nestjs/config";
import { JWTUser } from "../interfaces/jwt-user.interface";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { User } from "src/users/schemas/user.schema";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let rolesService: Partial<RolesService>;
  let usersService: Partial<UsersService>;
  let configService: Partial<ConfigService>;
  const userPayload = {
    _id: "user-id-123",
    username: "john_doe",
    email: "john@example.com",
    authStrategy: "jwt",
  } as User;

  beforeEach(async () => {
    rolesService = {
      find: jest.fn(),
    };

    usersService = {
      findByIdUserIdentity: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue("testSecret"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: RolesService, useValue: rolesService },
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return JWTUser with roles and accessGroups", async () => {
      (rolesService.find as jest.Mock).mockResolvedValue([
        { name: "admin" },
        { name: "editor" },
      ]);

      (usersService.findByIdUserIdentity as jest.Mock).mockResolvedValue({
        profile: {
          username: "john_doe",
          accessGroups: ["group1", "group2"],
        },
      });

      const result: JWTUser = await strategy.validate(userPayload);

      expect(result).toEqual({
        ...userPayload,
        currentGroups: ["admin", "editor", "john_doe", "group1", "group2"],
      });

      expect(rolesService.find).toHaveBeenCalledWith({
        userId: userPayload._id,
      });
      expect(usersService.findByIdUserIdentity).toHaveBeenCalledWith(
        userPayload._id,
      );
    });

    it("should handle no roles and no userIdentity gracefully", async () => {
      (rolesService.find as jest.Mock).mockResolvedValue(null);
      (usersService.findByIdUserIdentity as jest.Mock).mockResolvedValue(null);

      const result: JWTUser = await strategy.validate(userPayload);

      expect(result).toEqual({
        ...userPayload,
        currentGroups: [],
      });

      expect(rolesService.find).toHaveBeenCalledWith({
        userId: userPayload._id,
      });
      expect(usersService.findByIdUserIdentity).toHaveBeenCalledWith(
        userPayload._id,
      );
    });
  });
});
