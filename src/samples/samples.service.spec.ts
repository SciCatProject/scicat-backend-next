import { ConfigService } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { SamplesService } from "./samples.service";
import { Sample } from "./schemas/sample.schema";

const mockSample: Sample = {
  _id: "testId",
  sampleId: "testId",
  owner: "Test Owner",
  description: "Test Sample",
  createdAt: new Date(),
  updatedAt: new Date(),
  sampleCharacteristics: {},
  isPublished: false,
  attachments: [],
  datasets: [],
  ownerGroup: "testOwnerGroup",
  accessGroups: ["testAccessGroup"],
  instrumentGroup: "testInstrument",
  createdBy: "testUser",
  updatedBy: "testUser",
};

describe("SamplesService", () => {
  let service: Promise<SamplesService>;
  let sampleModel: Model<Sample>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        SamplesService,
        {
          provide: getModelToken("Sample"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockSample),
            constructor: jest.fn().mockResolvedValue(mockSample),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.resolve<SamplesService>(SamplesService);
    sampleModel = module.get<Model<Sample>>(getModelToken("Sample"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
