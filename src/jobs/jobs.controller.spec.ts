import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";

class JobsServiceMock {}
class DatasetsServiceMock {}

describe("JobsController", () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        CaslAbilityFactory,
        { provide: JobsService, useClass: JobsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
