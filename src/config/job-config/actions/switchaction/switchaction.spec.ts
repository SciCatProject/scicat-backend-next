import { SwitchJobAction } from "./switchaction";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { SwitchJobActionOptions, SwitchScope } from "./switchaction.interface";
import { Test, TestingModule } from "@nestjs/testing";
import {
  CREATE_JOB_ACTION_CREATORS,
  JobAction,
} from "../../jobconfig.interface";
import { ModuleRef } from "@nestjs/core";
import { JobClass } from "src/jobs/schemas/job.schema";

// Mock JobAction
interface MockAction {
  getActionType: () => string;
  validate: jest.Mock;
  performJob: jest.Mock;
}
function makeMockAction(actionType: string): MockAction {
  return {
    getActionType: () => actionType,
    validate: jest.fn(async () => {}),
    performJob: jest.fn(async () => {}),
  };
}

describe("SwitchAction", () => {
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
        expect(mockCase.performJob).toHaveBeenCalled();
      } else {
        expect(mockCase.validate).not.toHaveBeenCalled();
        expect(mockCase.performJob).not.toHaveBeenCalled();
      }
    }
  }

  // Job Config file
  const config: SwitchJobActionOptions = {
    actionType: "switch",
    scope: SwitchScope.Request,
    property: "jobParams.status",
    cases: [
      {
        match: "string_match",
        actions: [{ actionType: "case_string" }],
      },
      {
        match: "/regex.*match$/i",
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
      ],
    }).compile();

    moduleRef = module.get<ModuleRef>(ModuleRef);

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
      mockCase.performJob.mockClear();
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

    await expect(action.validate(jobDto)).resolves.toBeUndefined();
    await expect(
      action.performJob(jobDto as JobClass),
    ).resolves.toBeUndefined();

    expectCalled(caseString);
  });

  it("should support regex matches", async () => {
    const jobDto: CreateJobDto = {
      type: "test",
      jobParams: {
        status: "regex :D match",
      },
    };

    await expect(action.validate(jobDto)).resolves.toBeUndefined();
    await expect(
      action.performJob(jobDto as JobClass),
    ).resolves.toBeUndefined();

    expectCalled(caseRegex);
  });

  it("should match the regex to substrings", async () => {
    const jobDto: CreateJobDto = {
      type: "test",
      jobParams: {
        status: "prefixed regex's still match",
      },
    };

    await expect(action.validate(jobDto)).resolves.toBeUndefined();
    await expect(
      action.performJob(jobDto as JobClass),
    ).resolves.toBeUndefined();

    expectCalled(caseRegex);
  });

  it("should support regex flags", async () => {
    const jobDto: CreateJobDto = {
      type: "test",
      jobParams: {
        status: "Regex Case-Insensitive Match",
      },
    };

    await expect(action.validate(jobDto)).resolves.toBeUndefined();
    await expect(
      action.performJob(jobDto as JobClass),
    ).resolves.toBeUndefined();

    expectCalled(caseRegex);
  });

  it("should support JSON Schemas", async () => {
    const jobDto: CreateJobDto = {
      type: "test",
      jobParams: {
        status: "schema",
      },
    };

    await expect(action.validate(jobDto)).resolves.toBeUndefined();
    await expect(
      action.performJob(jobDto as JobClass),
    ).resolves.toBeUndefined();

    expectCalled(caseSchema);
  });

  it("should resolve to the default", async () => {
    const jobDto: CreateJobDto = {
      type: "test",
      jobParams: {
        status: "doesn't match anything",
      },
    };

    await expect(action.validate(jobDto)).resolves.toBeUndefined();
    await expect(
      action.performJob(jobDto as JobClass),
    ).resolves.toBeUndefined();

    expectCalled(caseDefault);
  });
});
