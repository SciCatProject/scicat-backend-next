import { HistoryClass } from "src/datasets/schemas/history.schema";
import { GenericHistory } from "../schemas/generic-history.schema";
import {
  DatasetClass,
  DatasetDocument,
} from "src/datasets/schemas/dataset.schema";

const IGNORE_FIELDS = ["updatedAt", "updatedBy", "_id"];

export function convertObsoleteHistoryToGenericHistory(
  history: HistoryClass,
  documentId: string,
): GenericHistory {
  const result: GenericHistory = {
    subsystem: "Dataset",
    documentId: documentId,
    user: history.updatedBy,
    operation: "update",
    timestamp: history.updatedAt,
    before: {},
    after: {},
  };
  const changeList = Object.keys(history).filter(
    (key) => !IGNORE_FIELDS.includes(key),
  );
  for (const key of changeList) {
    if (
      !history[key] ||
      !history[key].hasOwnProperty("previousValue") ||
      !history[key].hasOwnProperty("currentValue")
    ) {
      continue;
    }
    const fieldChange = history[key] as {
      previousValue: unknown;
      currentValue: unknown;
    };
    if (key === "datasetlifecycle") {
      const currentValue = fieldChange.currentValue as Record<string, unknown>;
      const previousValue = fieldChange.previousValue as Record<
        string,
        unknown
      >;
      // only retain the intersection of keys in currentValue and previousValue and whose value has changed. drop all others
      const prunedPreviousValue: Record<string, unknown> = {};
      const prunedCurrentValue: Record<string, unknown> = {};
      for (const subKey of Object.keys(currentValue)) {
        if (currentValue[subKey] !== previousValue[subKey]) {
          prunedPreviousValue[subKey] = previousValue[subKey];
          prunedCurrentValue[subKey] = currentValue[subKey];
        }
      }
      fieldChange.previousValue = prunedPreviousValue;
      fieldChange.currentValue = prunedCurrentValue;
    }
    result.before![key] = fieldChange.previousValue;
    result.after![key] = fieldChange.currentValue;
  }
  return result;
}

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
    if (field === "datasetlifecycle") {
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
