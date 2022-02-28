import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { JobsService } from "./jobs.service";
import { Job } from "./schemas/job.schema";

const mockJob: Job = {
  _id: "testId",
  emailJobInitiator: "test@email.com",
  type: "retrieve",
  creationTime: new Date(),
  executionTime: new Date(),
  jobParams: {},
  jobStatusMessage: "testStatus",
  datasetList: {},
  jobResultObject: {},
};

describe("JobsService", () => {
  let service: JobsService;
  let jobModel: Model<Job>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
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

    service = module.get<JobsService>(JobsService);
    jobModel = module.get<Model<Job>>(getModelToken("Job"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
