import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsService } from "src/datasets/datasets.service";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";

class JobsServiceMock {}
class DatasetsServiceMock {}
class OrigDatablocksServiceMock {}

describe("JobsController", () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        CaslAbilityFactory,
        { provide: JobsService, useClass: JobsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: EventEmitter2, useClass: EventEmitter2 },
        ConfigService,
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
