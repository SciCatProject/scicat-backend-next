import { SwitchJobAction } from "./switchaction";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { SwitchJobActionOptions, SwitchScope } from "./switchaction.interface";
import { Test, TestingModule } from "@nestjs/testing";
import { CREATE_JOB_ACTION_CREATORS } from "../../jobconfig.interface";
import { ModuleRef } from "@nestjs/core";

describe("SwitchAction", () => {
  const mockAction = {
    getActionType: () => "test",
    performJob: jest.fn(async () => {}),
    validate: jest.fn(async () => {}),
  };
  let module: TestingModule;
  let moduleRef: ModuleRef;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: CREATE_JOB_ACTION_CREATORS,
          useValue: {
            ["test"]: { create: () => mockAction },
          },
        },
      ],
    }).compile();

    moduleRef = module.get<ModuleRef>(ModuleRef);
  });

  beforeEach(async () => {
    // mockAction.performJob.
    expect(moduleRef).toBeDefined();
    expect(moduleRef["resolve"]).toBeDefined();

    mockAction.validate.mockClear();
    mockAction.performJob.mockClear();
  });

  describe("request validation", () => {
    const config: SwitchJobActionOptions = {
      actionType: "switch",
      scope: SwitchScope.Request,
      property: "jobParams.status",
      cases: [
        {
          match: "ok",
          actions: [
            {
              actionType: "test",
            },
          ],
        },
      ],
    };

    it("should be configured successfully", async () => {
      const action = new SwitchJobAction<CreateJobDto>(
        moduleRef,
        config,
        CREATE_JOB_ACTION_CREATORS,
      );

      expect(action).toBeDefined();
      expect(action["validate"]).toBeDefined();
    });

    it("should call the first case", async () => {
      const jobDto: CreateJobDto = {
        type: "test",
        jobParams: {
          status: "ok",
        },
      };
      const action = new SwitchJobAction<CreateJobDto>(
        moduleRef,
        config,
        CREATE_JOB_ACTION_CREATORS,
      );

      await action.validate(jobDto);
      expect(mockAction.validate).toHaveBeenCalled();
      expect(mockAction.performJob).not.toHaveBeenCalled();
    });
  });
});
