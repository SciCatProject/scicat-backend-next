import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ProposalsService } from "src/proposals/proposals.service";
import { LogbooksController } from "./logbooks.controller";
import { LogbooksService } from "./logbooks.service";

class LogbooksServiceMock {}

class CaslAbilityFactoryMock {}

class ProposalsServiceMock {}

describe("LogbooksController", () => {
  let controller: LogbooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogbooksController],
      providers: [
        { provide: LogbooksService, useClass: LogbooksServiceMock },
        { provide: ProposalsService, useClass: ProposalsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<LogbooksController>(LogbooksController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
