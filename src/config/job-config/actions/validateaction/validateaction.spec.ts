import { ValidateJobAction } from "./validateaction";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { ValidateJobActionOptions } from "./validateaction.interface";

const createJobBase = {
  type: "validate",
  ownerUser: "owner",
  ownerGroup: "group",
  contactEmail: "email@example.com",
};

describe("ValiateAction", () => {
  const config: ValidateJobActionOptions = {
    actionType: "validate",
    request: {
      "jobParams.stringVal": { type: "string" },
      "jobParams.requiredArray[*]": { type: "string" },
      "jobParams.numberVal": { type: "number" },
      jobParams: { required: ["nonNull"] },
    },
  };
  const action = new ValidateJobAction<CreateJobDto>(config);
  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should pass if required params are present", async () => {
    const dto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        stringVal: "ok",
        numberVal: 1,
        nonNull: "value1",
        requiredArray: ["ok"],
      },
    };

    await expect(action.validate(dto)).resolves.toBeUndefined();
  });

  it("should fail if nonNull is missing", async () => {
    const dto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        stringVal: "ok",
        numberVal: 1,
        //nonNull: "value1",
        requiredArray: ["ok"],
      },
    };

    await expect(action.validate(dto)).rejects.toThrow(
      "Invalid request. Invalid value for 'jobParams'",
    );
  });

  it("should fail if string type is wrong", async () => {
    const dto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        stringVal: 0xdeadbeef, // wrong type
        numberVal: 1,
        nonNull: "value1",
        requiredArray: ["ok"],
      },
    };

    await expect(action.validate(dto)).rejects.toThrow(
      "Invalid request. Invalid value for 'jobParams.stringVal",
    );
  });

  it("should fail if number type is wrong", async () => {
    const dto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        stringVal: "ok",
        numberVal: "error",
        nonNull: "value1",
        requiredArray: ["ok"],
      },
    };

    await expect(action.validate(dto)).rejects.toThrow(
      "Invalid request. Invalid value for 'jobParams.numberVal'",
    );
  });

  it("should fail if requiredArray is ommitted", async () => {
    const dto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        stringVal: "ok",
        numberVal: 1,
        nonNull: "value1",
        //requiredArray: ["ok"],
      },
    };

    await expect(action.validate(dto)).rejects.toThrow(
      "Invalid request. Requires 'jobParams.requiredArray[*]'",
    );
  });

  it("should fail if requiredArray is empty", async () => {
    const dto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        stringVal: "ok",
        numberVal: 1,
        nonNull: "value1",
        requiredArray: [],
      },
    };
    await expect(action.validate(dto)).rejects.toThrow(
      "Invalid request. Requires 'jobParams.requiredArray[*]'",
    );
  });

  it("should fail if requiredArray has the wrong type", async () => {
    const dto: CreateJobDto = {
      ...createJobBase,
      jobParams: {
        stringVal: "ok",
        numberVal: "error",
        nonNull: "value1",
        requiredArray: [0xdeadbeef],
      },
    };

    await expect(action.validate(dto)).rejects.toThrow(
      "Invalid request. Invalid value for 'jobParams.requiredArray[*]'",
    );
  });
});
