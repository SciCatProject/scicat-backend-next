import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { Job } from "./schemas/job.schema";

class JobsServiceMock {}
class DatasetsServiceMock {}

const mockJob: Job = {
  _id: "testId",
  id: "testId",
  emailJobInitiator: "test@email.com",
  type: "retrieve",
  creationTime: new Date(),
  executionTime: new Date(),
  jobParams: {},
  jobStatusMessage: "testStatus",
  datasetList: [],
  jobResultObject: {},
};

describe("JobsController", () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        CaslAbilityFactory,
        { provide: JobsService, useClass: JobsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        {
          provide: getModelToken("Job"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockJob),
            constructor: jest.fn().mockResolvedValue(mockJob),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
