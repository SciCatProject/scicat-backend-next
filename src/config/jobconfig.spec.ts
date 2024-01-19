import { loadJobConfig, getRegisteredCreateActions } from "./jobconfig";
import { LogJobAction } from "./actions/logaction";
import { registerDefaultActions } from "./configuration";

describe("Job configuration", () => {
  // TODO should be done automatically on init?
  registerDefaultActions();

  it("LogJobAction should be registered", async () => {
    const actions = getRegisteredCreateActions();
    expect("log" in actions);
  });
  it("Should be able to load from json", async () => {
    const path = "test/config/jobconfig.json";
    const config = await loadJobConfig(path);
    expect(config).toBeDefined();
    expect(config.length).toBe(1);
    expect(config[0].jobType).toBe("archive");
    expect(config[0].create).toBeDefined();
    const create = config[0].create;
    expect(create.actions.length).toBe(1);
    const action = create.actions[0];
    expect(action instanceof LogJobAction);
    expect(action.getActionType()).toBe("log");
    action.validate({ config: null });
  });
});
