import { Test, TestingModule } from "@nestjs/testing";
import { CaslModule } from "src/casl/casl.module";
import { ProposalsService } from "src/proposals/proposals.service";
import { LogbooksController } from "./logbooks.controller";
import { LogbooksService } from "./logbooks.service";

class LogbooksServiceMock {}

class ProposalsServiceMock {}

describe("LogbooksController", () => {
  let controller: LogbooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogbooksController],
      imports: [CaslModule],
      providers: [
        { provide: LogbooksService, useClass: LogbooksServiceMock },
        { provide: ProposalsService, useClass: ProposalsServiceMock },
      ],
    }).compile();

    controller = module.get<LogbooksController>(LogbooksController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
