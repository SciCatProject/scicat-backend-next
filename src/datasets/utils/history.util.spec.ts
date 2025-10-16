import { HistoryClass } from "src/datasets/schemas/history.schema";
import {
  convertGenericHistoriesToObsoleteHistories,
  convertGenericHistoryToObsoleteHistory,
  convertObsoleteHistoryToGenericHistory,
} from "./history.util";
import {
  DatasetClass,
  DatasetDocument,
} from "src/datasets/schemas/dataset.schema";
import { GenericHistory } from "../../common/schemas/generic-history.schema";

describe("History Utility Functions", () => {
  it("should convert obsolete history to generic history", () => {
    const obsoleteHistory: HistoryClass = {
      updatedAt: new Date("2023-10-01T12:00:00Z"),
      updatedBy: "user123",
      isPublished: {
        currentValue: true,
        previousValue: false,
      },
      datasetlifecycle: {
        currentValue: {
          publishedOn: new Date("2023-10-01T12:00:00Z"),
          archivable: true,
          retrievable: true,
        },
        previousValue: {
          archivable: false,
          retrievable: true,
          publishable: false,
          archiveRetentionTime: new Date("2031-10-01T12:00:00Z"),
          dateOfPublishing: new Date("2024-10-01T12:00:00Z"),
          isOnCentralDisk: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
          retrieveStatusMessage: "",
          retrieveIntegrityCheck: false,
        },
      },
      _id: "",
    };
    const documentId = "pid123";
    const genericHistory = convertObsoleteHistoryToGenericHistory(
      obsoleteHistory,
      documentId,
    );

    expect(genericHistory).toEqual({
      subsystem: "Dataset",
      documentId: "pid123",
      user: "user123",
      operation: "update",
      timestamp: new Date("2023-10-01T12:00:00Z"),
      before: {
        isPublished: false,
        datasetlifecycle: {
          publishedOn: undefined,
          archivable: false,
        },
      },
      after: {
        datasetlifecycle: {
          publishedOn: new Date("2023-10-01T12:00:00Z"),
          archivable: true,
        },
        isPublished: true,
      },
    });
  });

  it("should convert generic history to obsolete history", () => {
    const genericHistory: GenericHistory = {
      subsystem: "Dataset",
      documentId: "pid123",
      user: "user123",
      operation: "update",
      timestamp: new Date("2023-10-01T12:00:00Z"),
      before: {
        isPublished: false,
        datasetlifecycle: {
          publishedOn: undefined,
          archivable: false,
        },
      },
      after: {
        datasetlifecycle: {
          publishedOn: new Date("2023-10-01T12:00:00Z"),
          archivable: true,
        },
        isPublished: true,
      },
    };

    const currentDataset: Partial<DatasetClass> = {
      isPublished: true,
      datasetlifecycle: {
        publishedOn: new Date("2023-10-01T12:00:00Z"),
        archivable: true,
        retrievable: true,
        publishable: false,
        archiveRetentionTime: new Date("2031-10-01T12:00:00Z"),
        dateOfPublishing: new Date("2024-10-01T12:00:00Z"),
        isOnCentralDisk: true,
        archiveStatusMessage: "datasetOnArchiveDisk",
        retrieveStatusMessage: "",
        retrieveIntegrityCheck: false,
      },
    };
    const obsoleteHistory = convertGenericHistoryToObsoleteHistory(
      genericHistory,
      currentDataset,
    );

    expect(obsoleteHistory).toEqual({
      updatedAt: new Date("2023-10-01T12:00:00Z"),
      updatedBy: "user123",
      isPublished: {
        previousValue: false,
        currentValue: true,
      },
      datasetlifecycle: {
        previousValue: {
          publishedOn: undefined,
          archivable: false,
          retrievable: true,
          publishable: false,
          archiveRetentionTime: new Date("2031-10-01T12:00:00Z").toISOString(),
          dateOfPublishing: new Date("2024-10-01T12:00:00Z").toISOString(),
          isOnCentralDisk: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
          retrieveStatusMessage: "",
          retrieveIntegrityCheck: false,
        },
        currentValue: {
          publishedOn: new Date("2023-10-01T12:00:00Z").toISOString(),
          archivable: true,
        },
      },
      _id: "",
    });
  });

  it("should convert history list to obsolete histories", () => {
    const genericHistories: GenericHistory[] = [
      {
        subsystem: "Dataset",
        documentId: "pid123",
        user: "user123",
        operation: "update",
        timestamp: new Date("2023-10-02T12:00:00Z"),
        before: {
          isPublished: false,
          datasetlifecycle: {
            publishedOn: undefined,
            archivable: false,
          },
        },
        after: {
          datasetlifecycle: {
            publishedOn: new Date("2023-10-02T12:00:00Z"),
            archivable: true,
          },
          isPublished: true,
        },
      },
      {
        subsystem: "Dataset",
        documentId: "pid123",
        user: "user456",
        operation: "update",
        timestamp: new Date("2023-10-01T12:00:00Z"),
        before: {
          isPublished: false,
          datasetlifecycle: {
            publishedOn: undefined,
            archivable: false,
          },
        },
        after: {
          datasetlifecycle: {
            publishedOn: new Date("2023-10-01T12:00:00Z"),
            archivable: false,
          },
          isPublished: false,
        },
      },
    ];

    const currentDataset: Partial<DatasetDocument> = {
      isPublished: true,
      datasetlifecycle: {
        publishedOn: new Date("2023-10-02T12:00:00Z"),
        archivable: true,
        retrievable: true,
        publishable: false,
        archiveRetentionTime: new Date("2031-10-01T12:00:00Z"),
        dateOfPublishing: new Date("2024-10-01T12:00:00Z"),
        isOnCentralDisk: true,
        archiveStatusMessage: "datasetOnArchiveDisk",
        retrieveStatusMessage: "",
        retrieveIntegrityCheck: false,
      },
    };

    currentDataset.$clone = () => currentDataset as DatasetDocument; // Mock the $clone method

    const obsoleteHistories = convertGenericHistoriesToObsoleteHistories(
      genericHistories,
      currentDataset as DatasetDocument,
    );

    expect(obsoleteHistories).toEqual([
      {
        updatedAt: new Date("2023-10-02T12:00:00Z"),
        updatedBy: "user123",
        isPublished: {
          previousValue: false,
          currentValue: true,
        },
        datasetlifecycle: {
          previousValue: {
            publishedOn: undefined,
            archivable: false,
            retrievable: true,
            publishable: false,
            archiveRetentionTime: new Date(
              "2031-10-01T12:00:00Z",
            ).toISOString(),
            dateOfPublishing: new Date("2024-10-01T12:00:00Z").toISOString(),
            isOnCentralDisk: true,
            archiveStatusMessage: "datasetOnArchiveDisk",
            retrieveStatusMessage: "",
            retrieveIntegrityCheck: false,
          },
          currentValue: {
            publishedOn: new Date("2023-10-02T12:00:00Z").toISOString(),
            archivable: true,
          },
        },
        _id: "",
      },
      {
        updatedAt: new Date("2023-10-01T12:00:00Z"),
        updatedBy: "user456",
        isPublished: {
          previousValue: false,
          currentValue: false,
        },
        datasetlifecycle: {
          previousValue: {
            publishedOn: undefined,
            archivable: false,
            retrievable: true,
            publishable: false,
            archiveRetentionTime: new Date(
              "2031-10-01T12:00:00Z",
            ).toISOString(),
            dateOfPublishing: new Date("2024-10-01T12:00:00Z").toISOString(),
            isOnCentralDisk: true,
            archiveStatusMessage: "datasetOnArchiveDisk",
            retrieveStatusMessage: "",
            retrieveIntegrityCheck: false,
          },
          currentValue: {
            publishedOn: new Date("2023-10-01T12:00:00Z").toISOString(),
            archivable: false,
          },
        },
        _id: "",
      },
    ]);
  });
});
