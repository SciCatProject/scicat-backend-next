import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { InstrumentsController } from "./instruments.controller";
import { InstrumentsService } from "./instruments.service";

class InstrumentsServiceMock {}

class CaslAbilityFactoryMock {}

describe("InstrumentsController", () => {
  let controller: InstrumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [InstrumentsController],
      providers: [
        { provide: InstrumentsService, useClass: InstrumentsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<InstrumentsController>(InstrumentsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
