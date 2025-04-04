import { URLJobAction } from "./urlaction";
import { URLJobActionOptions } from "./urlaction.interface";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { JobClass } from "../../../../jobs/schemas/job.schema";

describe("URLJobAction", () => {
  const config: URLJobActionOptions = {
    actionType: "url",
    url: "http://localhost:3000/api/v3/health?jobid={{id}}",
    method: "GET",
    headers: { accept: "application/json" },
    body: "This is the body.",
  };

  const action = new URLJobAction<CreateJobDto>(config);

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should perform a GET request successfully", async () => {
    const job = { id: "12345" } as JobClass;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue("OK"),
    });

    await action.performJob(job);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v3/health?jobid=12345",
      {
        method: "GET",
        headers: { accept: "application/json" },
        body: "This is the body.",
      },
    );
  });

  it("should throw an error if the response is not ok", async () => {
    const job = { id: "12345" } as JobClass;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue("Internal Server Error"),
    });

    await expect(action.performJob(job)).rejects.toThrow(
      "Got response: Internal Server Error",
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v3/health?jobid=12345",
      {
        method: "GET",
        headers: { accept: "application/json" },
        body: "This is the body.",
      },
    );
  });
});
