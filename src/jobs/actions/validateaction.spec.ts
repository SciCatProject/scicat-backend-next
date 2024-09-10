import { ValidateAction } from "./validateaction";
import { CreateJobDto } from "../dto/create-job.dto";
import { HttpException } from "@nestjs/common";

describe("ValiateAction", () => {
  const config = {
    actionType: "validate",
    required: ["jobParams.nonNull", "jobParams.datasetIds[0]"],
  };
  const action = new ValidateAction<CreateJobDto>(config);
  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });
  it("should pass if required params are present", async () => {
    const dto: CreateJobDto = {
      type: "test",
      jobParams: {
        nonNull: "value1",
        datasetIds: ["value2"],
      },
      ownerUser: "owner",
      ownerGroup: "group",
      contactEmail: "email@example.com",
    };

    await expect(action.validate(dto)).resolves.toBeUndefined();
  });

  it("should fail if nonNull is missing", async () => {
    const dto: CreateJobDto = {
      type: "test",
      jobParams: {
        datasetIds: ["value2"],
      },
      ownerUser: "owner",
      ownerGroup: "group",
      contactEmail: "email@example.com",
    };

    await expect(action.validate(dto)).rejects.toThrowError(HttpException);
  });

  it("should fail if no datasets are given", async () => {
    const dto: CreateJobDto = {
      type: "test",
      jobParams: {
        nonNull: "value1",
        datasetIds: [],
      },
      ownerUser: "owner",
      ownerGroup: "group",
      contactEmail: "email@example.com",
    };

    await expect(action.validate(dto)).rejects.toThrowError(HttpException);
  });
});
