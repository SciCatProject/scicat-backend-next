import { ConfigService } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { DatasetsService } from "./datasets.service";
import { Dataset } from "./schemas/dataset.schema";
import { RawDataset } from "./schemas/raw-dataset.schema";

const mockDataset: RawDataset = {
  pid: "testPid",
  owner: "testOwner",
  ownerEmail: "testOwner@email.com",
  orcidOfOwner: "https://0000.0000.0000.0001",
  contactEmail: "testContact@email.com",
  sourceFolder: "/nfs/groups/beamlines/test/123456",
  sourceFolderHost: "https://fileserver.site.com",
  size: 1000000,
  packedSize: 1000000,
  numberOfFiles: 1,
  numberOfFilesArchived: 1,
  creationTime: new Date("2021-11-11T12:29:02.083Z"),
  type: "raw",
  validationStatus: "string",
  keywords: [],
  description: "Test dataset.",
  datasetName: "Test Dataset",
  classification: "string",
  license: "string",
  version: "string",
  isPublished: false,
  history: {},
  datasetLifeCycle: {
    id: "testId",
    archivable: true,
    retrievable: false,
    publishable: true,
    dateOfDiskPurging: new Date("2031-11-11T12:29:02.083Z"),
    archiveRetentionTime: new Date("2031-11-11T12:29:02.083Z"),
    dateOfPublishing: new Date("2024-11-11T12:29:02.083Z"),
    publishedOn: new Date("2024-11-11T12:29:02.083Z"),
    isOnCentralDisk: true,
    archiveReturnMessage: {},
    retrieveReturnMessage: {},
    archiveStatusMessage: "string",
    retrieveStatusMessage: "string",
    exportedTo: "string",
    retrieveIntegrityCheck: false,
  },
  createdAt: new Date("2021-11-11T12:29:02.083Z"),
  updatedAt: new Date("2021-11-11T12:29:02.083Z"),
  techniques: [],
  principalInvestigator: "testInvestigator",
  endTime: new Date("2021-12-11T12:29:02.083Z"),
  creationLocation: "test",
  dataFormat: "Test Format",
  scientificMetadata: {},
  proposalId: "ABCDEF",
};

describe("DatasetsService", () => {
  let service: DatasetsService;
  let model: Model<Dataset>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: getModelToken("Dataset"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockDataset),
            constructor: jest.fn().mockResolvedValue(mockDataset),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        DatasetsService,
      ],
    }).compile();

    service = module.get<DatasetsService>(DatasetsService);
    model = module.get<Model<Dataset>>(getModelToken("Dataset"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
