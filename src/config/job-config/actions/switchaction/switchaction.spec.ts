import { SwitchCreateJobAction, SwitchJobAction } from "./switchaction";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import {
  SwitchCreateJobActionOptions,
  SwitchJobActionOptions,
} from "./switchaction.interface";
import { DatasetsService } from "src/datasets/datasets.service";
import { Test, TestingModule } from "@nestjs/testing";
import { SwitchCreateJobActionCreator } from "./switchaction.service";

const createJobBase = {
  type: "validate",
  ownerUser: "owner",
  ownerGroup: "group",
  contactEmail: "email@example.com",
};

const mockDataset = {
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
  principalInvestigator: "testInvestigator",
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

describe("ValidateAction", () => {
  describe("request validation", () => {
    let action: SwitchJobAction<CreateJobDto>;

    beforeAll(() => {
      const config: SwitchJobActionOptions = {
        actionType: "validate",
        request: {
          "jobParams.stringVal": { type: "string" },
          "jobParams.requiredArray[*]": { type: "string" },
          "jobParams.numberVal": { type: "number" },
          jobParams: { required: ["nonNull"] },
        },
      };
      action = new SwitchJobAction<CreateJobDto>(config);
    });

    it("should be configured successfully", async () => {
      expect(action).toBeDefined();
      expect(action["request"]).toBeDefined();
    });

    it("should pass if required params are present", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {
          stringVal: "ok",
          numberVal: 1,
          nonNull: "value1",
          requiredArray: ["ok"],
        },
      };

      await expect(action.validate(dto)).resolves.toBeUndefined();
    });

    it("should fail if nonNull is missing", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {
          stringVal: "ok",
          numberVal: 1,
          //nonNull: "value1",
          requiredArray: ["ok"],
        },
      };

      await expect(action.validate(dto)).rejects.toThrow(
        "Invalid request. Invalid value for 'jobParams'",
      );
    });

    it("should fail if string type is wrong", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {
          stringVal: 0xdeadbeef, // wrong type
          numberVal: 1,
          nonNull: "value1",
          requiredArray: ["ok"],
        },
      };

      await expect(action.validate(dto)).rejects.toThrow(
        "Invalid request. Invalid value for 'jobParams.stringVal",
      );
    });

    it("should fail if number type is wrong", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {
          stringVal: "ok",
          numberVal: "error",
          nonNull: "value1",
          requiredArray: ["ok"],
        },
      };

      await expect(action.validate(dto)).rejects.toThrow(
        "Invalid request. Invalid value for 'jobParams.numberVal'",
      );
    });

    it("should fail if requiredArray is ommitted", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {
          stringVal: "ok",
          numberVal: 1,
          nonNull: "value1",
          //requiredArray: ["ok"],
        },
      };

      await expect(action.validate(dto)).rejects.toThrow(
        "Invalid request. Requires 'jobParams.requiredArray[*]'",
      );
    });

    it("should fail if requiredArray is empty", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {
          stringVal: "ok",
          numberVal: 1,
          nonNull: "value1",
          requiredArray: [],
        },
      };
      await expect(action.validate(dto)).rejects.toThrow(
        "Invalid request. Requires 'jobParams.requiredArray[*]'",
      );
    });

    it("should fail if requiredArray has the wrong type", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {
          stringVal: "ok",
          numberVal: "error",
          nonNull: "value1",
          requiredArray: [0xdeadbeef],
        },
      };

      await expect(action.validate(dto)).rejects.toThrow(
        "Invalid request. Invalid value for 'jobParams.requiredArray[*]'",
      );
    });
  });

  describe("dataset validation", () => {
    let creator: SwitchCreateJobActionCreator;
    let action: SwitchCreateJobAction;
    const findAll = jest.fn().mockResolvedValue([mockDataset]);
    const mockCreateDto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        datasetList: [
          {
            pid: mockDataset.pid,
            files: [],
          },
        ],
      },
    };

    beforeAll(async () => {
      // Create mock dataset
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: DatasetsService,
            useValue: {
              findAll: findAll,
            },
          },
          SwitchCreateJobActionCreator,
        ],
      }).compile();

      const config: SwitchCreateJobActionOptions = {
        actionType: "validate",
        datasets: {
          "datasetlifecycle.archivable": { const: true },
        },
      };

      creator = await module.resolve<SwitchCreateJobActionCreator>(
        SwitchCreateJobActionCreator,
      );
      action = creator.create(config);
    });

    it("should be configured successfully", async () => {
      expect(action).toBeDefined();
      expect(action["datasets"]).toBeDefined();
      expect(action["moduleRef"]).toBeDefined();
      const datasetsService = action["moduleRef"].resolve(DatasetsService);
      expect(datasetsService).toBeDefined();
    });

    it("should fail without a dataset", async () => {
      const dto: CreateJobDto = {
        ...createJobBase,
        jobParams: {},
      };

      await expect(action.validate(dto)).rejects.toThrow(
        "'jobParams.datasetList' is required.",
      );
    });

    it("should pass when referencing an archivable dataset", async () => {
      const dto: CreateJobDto = {
        ...mockCreateDto,
      };

      await expect(action.validate(dto)).resolves.toBeUndefined();
    });

    it("should fail when referencing a non-archivable dataset", async () => {
      const dto: CreateJobDto = {
        ...mockCreateDto,
      };
      const unarchivableDataset = {
        ...mockDataset,
      };
      unarchivableDataset.datasetlifecycle.archivable = false;

      findAll.mockResolvedValueOnce([unarchivableDataset]);
      await expect(action.validate(dto)).rejects.toThrow(
        "Invalid request. Invalid value for 'datasetlifecycle.archivable'",
      );
    });
  });
});
