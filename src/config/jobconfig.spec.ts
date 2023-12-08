import { loadJobConfig } from "./jobconfig";

describe("Job configuration", () => {
    it("Should be able to load from json", async () => {
        const path = "../../tests/config/jobconfig.json";
        const config = loadJobConfig(path);
        expect(config).toBeDefined();
    });
  });
