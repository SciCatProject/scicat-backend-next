import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/auth/auth.service";
import { CaslModule } from "src/casl/casl.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";

class UsersServiceMock {
  findByIdUserIdentity(id: string) {
    return { id };
  }

  async findByIdUserSettings(userId: string) {
    return mockUserSettings;
  }

  async findOneAndUpdateUserSettings(
    userId: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ) {
    return { ...updateUserSettingsDto, _id: userId };
  }
}

const mockUserSettings = {
  _id: "user1",
  userId: "user1",
  columns: [],
  datasetCount: 25,
  jobCount: 25,
  filters: [
    { type: "LocationFilterComponent", visible: true },
    { type: "PidFilterComponent", visible: true },
  ],
  conditions: [{ field: "status", value: "active", operator: "equals" }],
};

class AuthServiceMock {}

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      imports: [CaslModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: UsersService, useClass: UsersServiceMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    // bypass authorization
    jest
      .spyOn(controller as UsersController, "checkUserAuthorization")
      .mockImplementation(() => Promise.resolve());
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return user settings with filters and conditions", async () => {
    jest
      .spyOn(usersService, "findByIdUserSettings")
      .mockResolvedValue(mockUserSettings);

    const userId = "user1";
    const result = await controller.getSettings(
      { user: { _id: userId } },
      userId,
    );

    expect(result).toEqual(mockUserSettings);
    expect(result.filters).toBeDefined();
    expect(result.filters.length).toBeGreaterThan(0);
    expect(result.conditions).toBeDefined();
    expect(result.conditions.length).toBeGreaterThan(0);
  });

  it("should update user settings with filters and conditions", async () => {
    const updatedSettings = {
      ...mockUserSettings,
      filters: [{ type: "PidFilterContainsComponent", visible: false }],
      conditions: [{ field: "status", value: "inactive", operator: "equals" }],
    };

    jest
      .spyOn(usersService, "findOneAndUpdateUserSettings")
      .mockResolvedValue(updatedSettings);

    const userId = "user-id";
    const result = await controller.updateSettings(
      { user: { _id: userId } },
      userId,
      updatedSettings,
    );

    expect(result).toEqual(updatedSettings);
    expect(result.filters).toBeDefined();
    expect(result.filters.length).toBe(1);
    expect(result.conditions).toBeDefined();
    expect(result.conditions.length).toBe(1);
  });
});
