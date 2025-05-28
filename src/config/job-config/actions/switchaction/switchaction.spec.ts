import { SwitchJobAction } from "./switchaction";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { SwitchJobActionOptions, SwitchPhase } from "./switchaction.interface";
import { Test } from "@nestjs/testing";
import {
  CREATE_JOB_ACTION_CREATORS,
  JobAction,
  JobPerformContext,
  JobValidateContext,
} from "../../jobconfig.interface";
import { ModuleRef } from "@nestjs/core";
import { JobClass } from "src/jobs/schemas/job.schema";
import { DatasetsService } from "src/datasets/datasets.service";

// Mock JobAction
interface MockAction {
  getActionType: () => string;
  validate: jest.Mock;
  perform: jest.Mock;
}
function makeMockAction(actionType: string): MockAction {
  return {
    getActionType: () => actionType,
    validate: jest.fn(async () => {}),
    perform: jest.fn(async () => {}),
  };
}

const findAll = jest.fn();
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
// Define mock actions for each case.
const caseString = makeMockAction("case_string");
const caseRegex = makeMockAction("case_regex");
const caseSchema = makeMockAction("case_schema");
const caseDefault = makeMockAction("case_default");
const mockCases = [caseString, caseRegex, caseSchema, caseDefault];

function expectCalled(expectedCase: JobAction<CreateJobDto>) {
  for (const mockCase of mockCases) {
    if (mockCase === expectedCase) {
      expect(mockCase.validate).toHaveBeenCalled();
      expect(mockCase.perform).toHaveBeenCalled();
    } else {
      expect(mockCase.validate).not.toHaveBeenCalled();
      expect(mockCase.perform).not.toHaveBeenCalled();
    }
  }
}
async function makeModuleRef() {
  const module = await Test.createTestingModule({
    providers: [
      {
        provide: CREATE_JOB_ACTION_CREATORS,
        useValue: Object.fromEntries(
          mockCases.map((mockCase) => [
            [mockCase.getActionType()],
            { create: () => mockCase },
          ]),
        ),
      },
      {
        provide: DatasetsService,
        useValue: {
          findAll: findAll,
        },
      },
    ],
  }).compile();

  return module.get<ModuleRef>(ModuleRef);
}

describe("SwitchAction", () => {
  describe("with request property", () => {
    // Job Config file
    const config: SwitchJobActionOptions = {
      actionType: "switch",
      phase: SwitchPhase.All,
      property: "request.jobParams.status",
      cases: [
        {
          match: "string_match",
          actions: [{ actionType: "case_string" }],
        },
        {
          regex: "/regex.*match$/i",
          actions: [{ actionType: "case_regex" }],
        },
        {
          schema: {
            const: "schema",
          },
          actions: [{ actionType: "case_schema" }],
        },
        {
          actions: [{ actionType: "case_default" }],
        },
      ],
    };

    // module for resolving creators
    let moduleRef: ModuleRef;
    let action: SwitchJobAction<CreateJobDto>;

    beforeAll(async () => {
      moduleRef = await makeModuleRef();

      action = new SwitchJobAction<CreateJobDto>(
        moduleRef,
        config,
        CREATE_JOB_ACTION_CREATORS,
      );
    });

    beforeEach(async () => {
      // ensure nest module resolution worked
      expect(moduleRef).toBeDefined();
      expect(moduleRef["resolve"]).toBeDefined();

      // Clear mock functions
      mockCases.forEach((mockCase) => {
        mockCase.validate.mockClear();
        mockCase.perform.mockClear();
      });
    });

    it("should be configured successfully", async () => {
      expect(action).toBeDefined();
      expect(action["validate"]).toBeDefined();
    });

    it("should support string matches", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          status: "string_match",
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseString);
    });

    it("should support regex matches", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          status: "regex :D match",
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseRegex);
    });

    it("should match the regex to substrings", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          status: "prefixed regex's still match",
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseRegex);
    });

    it("should support regex flags", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          status: "Regex Case-Insensitive Match",
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseRegex);
    });

    it("should support JSON Schemas", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          status: "schema",
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseSchema);
    });

    it("should resolve to the default", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          status: "doesn't match anything",
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseDefault);
    });
  });

  describe("with datasets property", () => {
    // Job Config file
    const config: SwitchJobActionOptions = {
      actionType: "switch",
      phase: SwitchPhase.All,
      property: "datasets[*].datasetlifecycle.archivable",
      cases: [
        {
          match: true,
          //reuse case_string, even though it's a boolean match
          actions: [{ actionType: "case_string" }],
        },
        {
          actions: [{ actionType: "case_default" }],
        },
      ],
    };

    // module for resolving creators
    let moduleRef: ModuleRef;
    let action: SwitchJobAction<CreateJobDto>;

    beforeAll(async () => {
      moduleRef = await makeModuleRef();

      action = new SwitchJobAction<CreateJobDto>(
        moduleRef,
        config,
        CREATE_JOB_ACTION_CREATORS,
      );
    });

    beforeEach(async () => {
      // ensure nest module resolution worked
      expect(moduleRef).toBeDefined();
      expect(moduleRef["resolve"]).toBeDefined();

      // Clear mock functions
      mockCases.forEach((mockCase) => {
        mockCase.validate.mockClear();
        mockCase.perform.mockClear();
      });

      findAll.mockClear();
    });

    it("should be configured successfully", async () => {
      expect(action).toBeDefined();
      expect(action["validate"]).toBeDefined();
    });

    it("should fail without a dataset", async () => {
      findAll.mockResolvedValue([mockDataset]);
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {},
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context))
        .rejects.toThrowError
        //"'jobParams.datasetList' is required.",
        ();
      await expect(action.perform(context))
        .rejects.toThrowError
        //"'jobParams.datasetList' is required.",
        ();
      expect(caseString.validate).not.toHaveBeenCalled();
      expect(caseString.perform).not.toHaveBeenCalled();
      expect(caseDefault.validate).not.toHaveBeenCalled();
      expect(caseDefault.perform).not.toHaveBeenCalled();
    });

    it("should match archivable==true", async () => {
      findAll.mockResolvedValue([mockDataset]);
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          datasetList: [
            {
              pid: mockDataset.pid,
              files: [],
            },
          ],
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseString);
    });

    it("shouldn't match archivable==false", async () => {
      findAll.mockResolvedValue([
        {
          ...mockDataset,
          datasetlifecycle: {
            ...mockDataset.datasetlifecycle,
            archivable: false,
          },
        },
      ]);
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          datasetList: [
            {
              pid: mockDataset.pid,
              files: [],
            },
          ],
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseDefault);
    });

    it("should pass with multiple consistent datasets", async () => {
      findAll.mockResolvedValue([
        mockDataset,
        {
          ...mockDataset,
          pid: "otherPid",
        },
      ]);
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          datasetList: [
            {
              pid: mockDataset.pid,
              files: [],
            },
            {
              pid: "otherPid",
              files: [],
            },
          ],
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).resolves.toBeUndefined();
      await expect(action.perform(context)).resolves.toBeUndefined();

      expectCalled(caseString);
    });

    it("should fail with ambiguous datasets", async () => {
      findAll.mockResolvedValue([
        mockDataset,
        {
          ...mockDataset,
          pid: "otherPid",
          datasetlifecycle: {
            ...mockDataset.datasetlifecycle,
            archivable: false,
          },
        },
      ]);
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          datasetList: [
            {
              pid: mockDataset.pid,
              files: [],
            },
            {
              pid: "otherPid",
              files: [],
            },
          ],
        },
      };

      const context = { request: jobDto, job: jobDto as JobClass, env: {} };
      await expect(action.validate(context)).rejects.toThrowError(
        "Ambiguous value for 'datasets[*].datasetlifecycle.archivable' (2 distinct results).'",
      );
      await expect(action.perform(context)).rejects.toThrowError(
        "Ambiguous value for 'datasets[*].datasetlifecycle.archivable' (2 distinct results).'",
      );
      expect(caseString.validate).not.toHaveBeenCalled();
      expect(caseString.perform).not.toHaveBeenCalled();
      expect(caseDefault.validate).not.toHaveBeenCalled();
      expect(caseDefault.perform).not.toHaveBeenCalled();
    });
  });

  /**
   * The id property is not available in request scope
   */
  describe("requesting a non-DTO property", () => {
    // Job Config file
    const config: SwitchJobActionOptions = {
      actionType: "switch",
      phase: SwitchPhase.All,
      property: "job.id",
      cases: [
        {
          schema: { type: "string" },
          actions: [{ actionType: "case_string" }],
        },
        {
          actions: [{ actionType: "case_default" }],
        },
      ],
    };

    // module for resolving creators
    let moduleRef: ModuleRef;
    let action: SwitchJobAction<CreateJobDto>;

    beforeAll(async () => {
      moduleRef = await makeModuleRef();

      action = new SwitchJobAction<CreateJobDto>(
        moduleRef,
        config,
        CREATE_JOB_ACTION_CREATORS,
      );
    });

    beforeEach(async () => {
      // ensure nest module resolution worked
      expect(moduleRef).toBeDefined();
      expect(moduleRef["resolve"]).toBeDefined();

      // Clear mock functions
      mockCases.forEach((mockCase) => {
        mockCase.validate.mockClear();
        mockCase.perform.mockClear();
      });
    });

    it("should be configured successfully", async () => {
      expect(action).toBeDefined();
      expect(action["validate"]).toBeDefined();
    });

    it("should fall back to default during validation", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {},
      };
      // No job set during the validate phase
      const validateContext = {
        request: jobDto,
        env: {},
      } as JobValidateContext<CreateJobDto>;
      await expect(action.validate(validateContext)).resolves.toBeUndefined();

      // No match; call default case
      expect(caseString.validate).not.toHaveBeenCalled();
      expect(caseDefault.validate).toHaveBeenCalled();
    });

    it("should match during perform", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {},
      };
      // job is set during the perform phase
      const performContext = {
        request: jobDto,
        job: { ...jobDto, id: "testId" },
        env: {},
      } as JobPerformContext<CreateJobDto>;
      await expect(action.perform(performContext)).resolves.toBeUndefined();

      expect(caseString.perform).toHaveBeenCalled();
      expect(caseDefault.perform).not.toHaveBeenCalled();
    });
  });
});
