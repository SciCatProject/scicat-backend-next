import { Schema } from "mongoose";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { applyHistoryPluginOnce } from "./history.plugin.util";
import { historyPlugin } from "./history.plugin";
import { ConfigService } from "@nestjs/config";

jest.mock("./history.plugin", () => ({
  historyPlugin: jest.fn(),
}));

describe("applyHistoryPluginOnce", () => {
  let schema: Schema;
  let configService: Partial<ConfigService>;

  beforeEach(() => {
    jest.spyOn(Logger, "debug").mockImplementation(() => {});
    jest.spyOn(Logger, "error").mockImplementation(() => {});
    schema = new Schema();
    configService = {
      get: jest.fn(),
    };
    (historyPlugin as jest.Mock).mockClear();
    (Logger.debug as jest.Mock).mockClear();
    (Logger.error as jest.Mock).mockClear();
  });

  it("throws if schema has no collection", () => {
    expect(() =>
      applyHistoryPluginOnce(schema, configService as ConfigService),
    ).toThrow(InternalServerErrorException);
  });

  it("does nothing if modelName not in trackables", () => {
    schema.set("collection", "Dataset");
    (configService.get as jest.Mock).mockImplementation((key) => {
      if (key === "TRACKABLES") {
        return ["OtherModel"];
      }
      if (key === "trackableStrategy") {
        return "delta";
      }
      return undefined;
    });

    applyHistoryPluginOnce(schema, configService as ConfigService);

    expect(historyPlugin).not.toHaveBeenCalled();
    expect(Logger.debug).not.toHaveBeenCalled();
  });

  it("applies plugin if not yet applied and in trackables", () => {
    schema.set("collection", "Dataset");
    (configService.get as jest.Mock).mockImplementation((key) => {
      if (key === "TRACKABLES") {
        return ["Dataset"];
      }
      if (key === "trackableStrategy") {
        return "document";
      }
      return undefined;
    });

    applyHistoryPluginOnce(schema, configService as ConfigService);

    expect(historyPlugin).toHaveBeenCalledWith(
      expect.anything(), // schema
      expect.objectContaining({
        modelName: "Dataset",
        trackableStrategy: "document",
      }),
    );
    expect(Logger.debug).toHaveBeenCalledWith(
      "History tracking enabled for model: Dataset",
      "HistoryPlugin",
    );
    expect((schema as Schema)._historyPluginApplied).toBe(true);
  });

  it("does not re-apply plugin if already applied", () => {
    schema.set("collection", "Dataset");
    (schema as Schema)._historyPluginApplied = true;
    (configService.get as jest.Mock).mockImplementation((key) => {
      if (key === "TRACKABLES") {
        return ["Dataset"];
      }
      return undefined;
    });

    applyHistoryPluginOnce(schema, configService as ConfigService);

    expect(historyPlugin).not.toHaveBeenCalled();
    expect(Logger.debug).not.toHaveBeenCalled();
  });

  it("logs error if plugin throws and _historyPluginApplied should be false", () => {
    schema.set("collection", "Dataset");
    (configService.get as jest.Mock).mockReturnValue(["Dataset"]);
    (historyPlugin as jest.Mock).mockImplementation(() => {
      throw new Error("fail");
    });

    applyHistoryPluginOnce(schema, configService as ConfigService);

    expect(Logger.error).toHaveBeenCalledWith(
      "Error applying history plugin",
      expect.objectContaining({
        context: "DatasetSchema",
        error: expect.any(Error),
      }),
    );
    expect((schema as Schema)._historyPluginApplied).toBe(false);
  });
});
