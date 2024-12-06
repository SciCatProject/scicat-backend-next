import { ConfigModule } from "@nestjs/config";
import { LogJobAction } from "./actions/logaction/logaction";
import { JobConfigService } from "./jobconfig.service";
import { Test } from "@nestjs/testing";
import { actionType as logActionType } from "./actions/logaction/logaction.interface";
import { actionType as validateActionType } from "./actions/validateaction/validateaction.interface";
import {
  CREATE_JOB_ACTION_FACTORIES,
  UPDATE_JOB_ACTION_FACTORIES,
} from "./jobconfig.interface";

const actionFactoryMock = {
  create: jest.fn(() => new LogJobAction({ actionType: "log" })),
};
const factoriesMock = {
  [logActionType]: actionFactoryMock,
  [validateActionType]: actionFactoryMock,
};
const factoryProviders = [
  {
    provide: CREATE_JOB_ACTION_FACTORIES,
    useValue: factoriesMock,
  },
  {
    provide: UPDATE_JOB_ACTION_FACTORIES,
    useValue: factoriesMock,
  },
];

describe("Job configuration", () => {
  const path = "test/config/jobconfig.yaml";

  it("JobConfigService should be loaded from yaml", async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [() => ({ jobConfigurationFile: path })],
        }),
      ],
      providers: [...factoryProviders, JobConfigService],
    }).compile();

    const jobConfigService = module.get<JobConfigService>(JobConfigService);
    const jobConfigs = jobConfigService.allJobConfigs;

    expect("all_access" in jobConfigs);
    const jobConfig = jobConfigService.get("all_access");
    expect(jobConfig.create.actions.length).toBe(1);
    const action = jobConfig.create.actions[0];
    expect(action instanceof LogJobAction);
    expect(action.getActionType()).toBe("log");

    expect("validate" in jobConfigs);
  });
});
