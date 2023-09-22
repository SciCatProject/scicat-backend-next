import {ConfigService} from "@nestjs/config";
import {getModelToken} from "@nestjs/mongoose";
import {Test, TestingModule} from "@nestjs/testing";
import {Model} from "mongoose";
import {SamplesService} from "./samples.service";
import {SampleClass} from "./schemas/sample.schema";

const mockSample: SampleClass = {
  _id: "testId",
  sampleId: "testId",
  owner: "Test Owner",
  description: "Test Sample",
  createdAt: new Date(),
  updatedAt: new Date(),
  sampleCharacteristics: {},
  isPublished: false,
  ownerGroup: "testOwnerGroup",
  accessGroups: ["testAccessGroup"],
  instrumentGroup: "testInstrument",
  createdBy: "testUser",
  updatedBy: "testUser",
};

describe("SamplesService", () => {
  let service: SamplesService;
  let sampleModel: Model<SampleClass>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        SamplesService,
        {
          provide: getModelToken("SampleClass"),
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

    service = await module.resolve<SamplesService>(SamplesService);
    sampleModel = module.get<Model<SampleClass>>(getModelToken("SampleClass"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
