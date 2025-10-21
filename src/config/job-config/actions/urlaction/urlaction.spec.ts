import { URLJobAction } from "./urlaction";
import { URLJobActionOptions } from "./urlaction.interface";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { JobClass } from "../../../../jobs/schemas/job.schema";

describe("URLJobAction", () => {
  const config: URLJobActionOptions = {
    actionType: "url",
    url: "http://localhost:3000/api/v3/health?jobid={{job.id}}",
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer {{env.URLACTIONSPEC_AUTH_TOKEN}}",
    },
    body: "This is the body.",
  };

  process.env.URLACTIONSPEC_AUTH_TOKEN = "TheAuthToken";

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

    const context = { request: job, job, env: process.env, datasets: [] };
    await action.perform(context);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v3/health?jobid=12345",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer TheAuthToken",
        },
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

    const context = { request: job, job, env: process.env, datasets: [] };
    await expect(action.perform(context)).rejects.toThrow(
      "A remote URL call failed with response: Internal Server Error",
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v3/health?jobid=12345",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer TheAuthToken",
        },
        body: "This is the body.",
      },
    );
  });

  it("should ignore http errors if the ignoreError is set", async () => {
    const job = { id: "12345" } as JobClass;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue("Internal Server Error"),
    });

    const actionIgnore = new URLJobAction<CreateJobDto>({
      ...config,
      ignoreErrors: true,
    });

    const context = { request: job, job, env: process.env, datasets: [] };
    await expect(actionIgnore.perform(context)).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v3/health?jobid=12345",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer TheAuthToken",
        },
        body: "This is the body.",
      },
    );
  });

  it("should ignore exceptions if the ignoreError is set", async () => {
    const job = { id: "12345" } as JobClass;
    (global.fetch as jest.Mock).mockImplementation(() => {
      throw new Error("Network error");
    });

    const actionIgnore = new URLJobAction<CreateJobDto>({
      ...config,
      ignoreErrors: true,
    });

    const context = { request: job, job, env: process.env, datasets: [] };
    await expect(actionIgnore.perform(context)).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v3/health?jobid=12345",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer TheAuthToken",
        },
        body: "This is the body.",
      },
    );
  });
});
