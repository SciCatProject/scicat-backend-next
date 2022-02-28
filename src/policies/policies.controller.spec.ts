import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { PoliciesController } from "./policies.controller";
import { PoliciesService } from "./policies.service";

class PoliciesServiceMock {}

describe("PoliciesController", () => {
  let controller: PoliciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoliciesController],
      providers: [
        CaslAbilityFactory,
        { provide: PoliciesService, useClass: PoliciesServiceMock },
      ],
    }).compile();

    controller = module.get<PoliciesController>(PoliciesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
