import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { InitialDatasetsService } from "./initial-datasets.service";
import { InitialDataset } from "./schemas/initial-dataset.schema";

const mockInitialDataset: InitialDataset = {
  _id: "testId",
};

describe("InitialDatasetsService", () => {
  let service: InitialDatasetsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let initialDatasetModel: Model<InitialDataset>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitialDatasetsService,
        {
          provide: getModelToken("InitialDataset"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockInitialDataset),
            constructor: jest.fn().mockResolvedValue(mockInitialDataset),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InitialDatasetsService>(InitialDatasetsService);
    initialDatasetModel = module.get<Model<InitialDataset>>(
      getModelToken("InitialDataset"),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
