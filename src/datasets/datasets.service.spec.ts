import { ConfigService } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { InitialDatasetsService } from "src/initial-datasets/initial-datasets.service";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { ElasticSearchService } from "src/elastic-search/elastic-search.service";
import { DatasetsService } from "./datasets.service";
import { DatasetClass } from "./schemas/dataset.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsAccessService } from "./datasets-access.service";

class InitialDatasetsServiceMock {}

class LogbooksServiceMock {}

class ElasticSearchServiceMock {}

const mockDataset: DatasetClass = {
  _id: "testId",
  pid: "testPid",
  owner: "testOwner",
  ownerEmail: "testOwner@email.com",
  instrumentIds: ["testInstrumentId"],
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
  history: [],
  datasetlifecycle: {
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
  principalInvestigators: ["testInvestigator"],
  endTime: new Date("2021-12-11T12:29:02.083Z"),
  creationLocation: "test",
  dataFormat: "Test Format",
  scientificMetadata: {},
  proposalIds: ["ABCDEF"],
  sampleIds: ["testSampleId"],
  accessGroups: [],
  createdBy: "test user",
  ownerGroup: "test",
  relationships: [],
  sharedWith: [],
  updatedBy: "test",
  instrumentGroup: "test",
  inputDatasets: [],
  usedSoftware: [],
  jobParameters: {},
  jobLogData: "",
  comment: "",
  dataQualityMetrics: 1,
};

describe("DatasetsService", () => {
  let service: DatasetsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<DatasetClass>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: getModelToken("DatasetClass"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockDataset),
            constructor: jest.fn().mockResolvedValue(mockDataset),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        DatasetsService,
        DatasetsAccessService,
        {
          provide: InitialDatasetsService,
          useClass: InitialDatasetsServiceMock,
        },
        { provide: LogbooksService, useClass: LogbooksServiceMock },
        { provide: ElasticSearchService, useClass: ElasticSearchServiceMock },
        CaslAbilityFactory,
      ],
    }).compile();

    service = await module.resolve<DatasetsService>(DatasetsService);
    model = module.get<Model<DatasetClass>>(getModelToken("DatasetClass"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
