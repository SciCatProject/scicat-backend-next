import { Schema } from "mongoose";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { historyPlugin } from "./history.plugin";
import { GenericHistory } from "src/common/schemas/generic-history.schema";
import { getCurrentUsername } from "src/common/utils/request-context.util";
import { ConfigService } from "@nestjs/config";

export function applyHistoryPluginOnce(
  schema: Schema,
  configService: ConfigService,
) {
  const modelName = schema.get("collection");
  if (!modelName) {
    throw new InternalServerErrorException(
      "Model name is not defined in schema",
    );
  }

  const trackables = configService.get<string[]>("TRACKABLES") || [];
  const trackableStrategy =
    configService?.get<string>("trackableStrategy") === "delta"
      ? "delta"
      : "document";

  const shouldTrack =
    !schema._historyPluginApplied && trackables.includes(modelName);

  if (shouldTrack) {
    try {
      schema.plugin(historyPlugin, {
        historyModelName: GenericHistory.name,
        modelName: modelName,
        getActiveUser: () => {
          return getCurrentUsername();
        },
        trackableStrategy,
      });
      Logger.debug(
        `History tracking enabled for model: ${modelName}`,
        "HistoryPlugin",
      );
      schema._historyPluginApplied = true;
    } catch (error) {
      Logger.error(`Error applying history plugin`, {
        context: `${modelName}Schema`,
        error,
      });
      schema._historyPluginApplied = false;
    }
  }

  return schema;
}
