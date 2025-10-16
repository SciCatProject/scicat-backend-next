import { HistoryClass } from "src/datasets/schemas/history.schema";
import { GenericHistory } from "../../common/schemas/generic-history.schema";
import {
  DatasetClass,
  DatasetDocument,
} from "src/datasets/schemas/dataset.schema";

const IGNORE_FIELDS = ["updatedAt", "updatedBy", "_id"];

// Given a dataset snapshot and a history entry, reconstruct the obsolete history entry
export function convertGenericHistoryToObsoleteHistory(
  history: GenericHistory,
  datasetSnapshot: Partial<DatasetClass>,
): HistoryClass {
  const result: HistoryClass = {
    updatedAt: history.timestamp,
    updatedBy: history.user ?? "",
    _id: "",
  };
  for (const field in history.before) {
    if (IGNORE_FIELDS.includes(field)) {
      continue;
    }
    if (field === "datasetlifecycle" && datasetSnapshot.datasetlifecycle) {
      history.before[field] = {
        ...JSON.parse(JSON.stringify(datasetSnapshot.datasetlifecycle)),
        ...(history.before[field] as Record<string, unknown>),
      };
      history.after![field] = JSON.parse(
        JSON.stringify(history.after![field] as Record<string, unknown>),
      );
    }
    result[field] = {
      previousValue: history.before[field],
      currentValue: history.after?.[field],
    };
  }
  return result;
}

// starting from the latest dataset, replay the history entries in reverse order to reconstruct the obsolete history entries
export function convertGenericHistoriesToObsoleteHistories(
  histories: GenericHistory[],
  currentDataset: DatasetDocument,
): HistoryClass[] {
  currentDataset = currentDataset.$clone();
  const result: HistoryClass[] = [];
  for (const history of histories) {
    const obsoleteHistory = convertGenericHistoryToObsoleteHistory(
      history,
      currentDataset,
    );
    for (const key of Object.keys(history.before || {})) {
      (currentDataset as unknown as Record<string, unknown>)[key] =
        history.before?.[key];
    }
    result.push(obsoleteHistory);
  }
  return result;
}
