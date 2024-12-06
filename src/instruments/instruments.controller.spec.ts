import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { InstrumentsController } from "./instruments.controller";
import { InstrumentsService } from "./instruments.service";

class InstrumentsServiceMock {}

describe("InstrumentsController", () => {
  let controller: InstrumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [
        CaslAbilityFactory,
        { provide: InstrumentsService, useClass: InstrumentsServiceMock },
        ConfigService,
      ],
    }).compile();

    controller = module.get<InstrumentsController>(InstrumentsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
