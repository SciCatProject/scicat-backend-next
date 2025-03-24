import { HttpStatus } from "@nestjs/common";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { ErrorJobAction } from "./erroraction";
import { ErrorJobActionOptions } from "./erroraction.interface";
import { makeHttpException } from "src/common/utils";

describe("ErrorJobAction", () => {
  const config: ErrorJobActionOptions = {
    actionType: "error",
    message: "JobType: {{ type }}",
    status: HttpStatus.I_AM_A_TEAPOT,
  };

  const action = new ErrorJobAction(config);

  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should throw an error", async () => {
    const job = {
      id: "12345",
      type: "test_error",
    } as JobClass;

    await expect(action.validate(job)).rejects.toThrowError(
      makeHttpException("JobType: test_error", HttpStatus.I_AM_A_TEAPOT),
    );
  });
});
