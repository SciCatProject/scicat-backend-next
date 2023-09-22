import {ConfigService} from "@nestjs/config";
import {getModelToken} from "@nestjs/mongoose";
import {Test, TestingModule} from "@nestjs/testing";
import {Model} from "mongoose";
import {MailService} from "src/common/mail.service";
import {DatasetsService} from "src/datasets/datasets.service";
import {PoliciesService} from "src/policies/policies.service";
import {JobsService} from "./jobs.service";
import {Job} from "./schemas/job.schema";

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

class DatasetsServiceMock {}

class MailServiceMock {}

class PoliciesServiceMock {}

describe("JobsService", () => {
  let service: JobsService;
  let jobModel: Model<Job>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {provide: DatasetsService, useClass: DatasetsServiceMock},
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
        {provide: MailService, useClass: MailServiceMock},
        {provide: PoliciesService, useClass: PoliciesServiceMock},
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobModel = module.get<Model<Job>>(getModelToken("Job"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
