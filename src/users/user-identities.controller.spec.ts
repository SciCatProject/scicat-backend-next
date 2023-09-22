import {Test, TestingModule} from "@nestjs/testing";
import {CaslModule} from "src/casl/casl.module";
import {UserIdentitiesController} from "./user-identities.controller";
import {UserIdentitiesService} from "./user-identities.service";

class UserIdentitiesServiceMock {}

describe("UserIdentitiesController", () => {
  let controller: UserIdentitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserIdentitiesController],
      imports: [CaslModule],
      providers: [
        {provide: UserIdentitiesService, useClass: UserIdentitiesServiceMock},
      ],
    }).compile();

    controller = module.get<UserIdentitiesController>(UserIdentitiesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
