import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/auth/auth.service";
import { CaslModule } from "src/casl/casl.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";
import { Request } from "express";
import { UserSettings } from "./schemas/user-settings.schema";

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
  datasetCount: 25,
  jobCount: 25,
  externalSettings: {
    filters: [{ LocationFilter: true }, { PidFilter: true }],
    conditions: [{ field: "status", value: "active", operator: "equals" }],
    columns: [],
  },
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

    jest
      .spyOn(controller as UsersController, "checkUserAuthorization")
      .mockImplementation(() => Promise.resolve());
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return user settings with filters and conditions", async () => {
    const userId = "user1";
    mockUserSettings._id = userId;

    const mockRequest: Partial<Request> = {
      user: { _id: userId },
    };

    const result = await controller.getSettings(mockRequest as Request, userId);

    // Assert
    expect(result?.externalSettings).toEqual(mockUserSettings);
    expect(result?.externalSettings?.filters).toBeDefined();
    expect(
      (result?.externalSettings?.filters as Record<string, unknown>).length,
    ).toBeGreaterThan(0);
    expect(result?.externalSettings?.conditions).toBeDefined();
    expect(
      (result?.externalSettings?.conditions as Record<string, unknown>).length,
    ).toBeGreaterThan(0);
  });

  it("should update user settings with filters and conditions", async () => {
    const userId = "user-id";
    mockUserSettings._id = userId;

    const updatedSettings = {
      ...mockUserSettings,
      externalSettings: {
        filters: [{ PidFilter: true }],
        conditions: [
          { field: "status", value: "inactive", operator: "equals" },
        ],
        columns: [],
      },
    };

    const mockRequest: Partial<Request> = {
      user: { _id: userId },
    };

    const expectedResponse: UserSettings = {
      ...updatedSettings,
      _id: userId,
      userId: userId, // Ensure all required properties are included
      datasetCount: updatedSettings.datasetCount,
      jobCount: updatedSettings.jobCount,
      externalSettings: updatedSettings.externalSettings,
    };

    jest
      .spyOn(usersService, "findOneAndUpdateUserSettings")
      .mockResolvedValue(expectedResponse);

    const result = await controller.updateSettings(
      mockRequest as Request,
      userId,
      updatedSettings,
    );

    expect(result?.externalSettings).toEqual(updatedSettings);
    expect(result?.externalSettings?.filters).toBeDefined();
    expect(
      (result?.externalSettings?.filters as Record<string, unknown[]>).length,
    ).toBe(1);
    expect(result?.externalSettings?.conditions).toBeDefined();
    expect(
      (result?.externalSettings?.conditions as Record<string, unknown[]>)
        .length,
    ).toBe(1);
  });
});
