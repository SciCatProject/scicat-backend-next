import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { UserIdentitiesController } from "./user-identities.controller";
import { UserIdentitiesService } from "./user-identities.service";

class UserIdentitiesServiceMock {}

class CaslAbilityFactoryMock {}

describe("UserIdentitiesController", () => {
  let controller: UserIdentitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserIdentitiesController],
      providers: [
        { provide: UserIdentitiesService, useClass: UserIdentitiesServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<UserIdentitiesController>(UserIdentitiesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
