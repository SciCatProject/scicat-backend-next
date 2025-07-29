import { ConfigService } from "@nestjs/config";
import { Document, QueryWithHelpers, Schema } from "mongoose"; // Import QueryWithHelpers
import {
  GenericHistory,
  GenericHistoryDocument,
} from "../../schemas/generic-history.schema";
import { computeDeltaWithOriginals } from "../../utils/delta.util";
import { Logger } from "@nestjs/common";

const logger = new Logger("HistoryPlugin");

interface HistoryPluginOptions {
  historyModelName?: string;
  modelName?: string;
  getActiveUser?: () => string | undefined; // Function to get current user context if needed
  configService?: ConfigService; // Optional ConfigService for accessing environment variables
  // Add these two new options
  trackableStrategy?: "delta" | "document";
  trackables?: string[];
}

// Define an interface for the query context including our custom property
// Make it generic over the Document type (T) and the Result type (Res)
// Use QueryWithHelpers for better compatibility with Mongoose's internal types
interface QueryWithHistory<
  Res, // Result type of the query (e.g., T | null, DeleteResult)
  T extends Document, // Document type
> extends QueryWithHelpers<Res, T, object> {
  // Use object for THelpers
  _originalDoc?: T | (T & Document<unknown, object, T>[]) | null; // Store the original doc(s) fetched
}

export function historyPlugin(
  schema: Schema,
  options: HistoryPluginOptions = {},
) {
  const {
    historyModelName = GenericHistory.name,
    modelName, // Use original name without alias, as it may not be needed
    getActiveUser: getActiveUser,
    configService,
    // Extract from options with fallbacks to ConfigService values
    trackableStrategy: explicitStrategy,
    trackables: explicitTrackables,
  } = options;

  // Use options if provided, otherwise try ConfigService, then fall back to defaults
  const trackableStrategy =
    explicitStrategy || // Use || instead of ?? to handle empty strings
    (configService?.get<string>("trackableStrategy") === "delta"
      ? "delta"
      : "document");

  const trackables =
    explicitTrackables || configService?.get<string[]>("trackables") || [];

  // Get the model name from options
  if (!modelName) {
    // If not provided, warn and skip setup
    logger.warn(
      "HistoryPlugin: Could not determine model name for schema. Please provide a modelName in plugin options.",
    );
    return; // Skip setup if we can't determine the model name
  }

  // Skip setting up the plugin if the model is not trackable
  if (!trackables.includes(modelName)) {
    return;
  }
  logger.debug(`History tracking enabled for model: ${modelName}`);

  const recordHistoryEntry = async <T, U extends Document>(
    operation: "update" | "delete",
    originalDoc: Document,
    updatedDoc: Document | null,
    context: QueryWithHistory<T, U>,
  ): Promise<void> => {
    if (!originalDoc) return;

    try {
      // Get the history model using the context to maintain proper connection
      const HistoryModel =
        context.model.db.model<GenericHistoryDocument>(historyModelName);
      if (!HistoryModel) {
        logger.error(
          `HistoryPlugin Error: History model "${historyModelName}" not found.`,
        );
        return;
      }

      const user = getActiveUser ? getActiveUser() : undefined;

      let beforeData, afterData;

      if (trackableStrategy === "document") {
        beforeData = originalDoc;
        afterData = updatedDoc ? updatedDoc.toObject() : null;
      } else if (updatedDoc) {
        const docObj = updatedDoc.toObject();
        const plainOriginalDoc = ensurePlainObject(originalDoc);

        const { delta, originals } = computeDeltaWithOriginals(
          plainOriginalDoc,
          docObj,
        );

        beforeData = originals;
        afterData = delta;
      } else {
        beforeData = originalDoc;
        afterData = null;
      }

      await HistoryModel.create({
        subsystem: modelName,
        documentId: originalDoc._id,
        before: beforeData,
        after: afterData,
        operation: operation,
        user: user,
      });
    } catch (error) {
      logger.error(
        `HistoryPlugin Error recording ${operation} for ${modelName}:`,
        error,
      );
    }
  };

  // Middleware for update operations ('findOneAndUpdate')
  schema.pre(
    "findOneAndUpdate",
    // Specify the expected result type (Document | null) and the Document type
    async function (this: QueryWithHistory<Document | null, Document>, next) {
      // Type 'this' to include _originalDoc
      try {
        const docToUpdate = await this.model
          .findOne(this.getQuery())
          .lean<Document>() // Keep lean<Document> or use a specific interface for the plain object
          .exec();
        if (docToUpdate) {
          // Assign the potentially plain object from lean() to _originalDoc
          // Cast lean result if needed, or adjust _originalDoc type
          this._originalDoc = docToUpdate as Document;
        }
      } catch (error) {
        logger.error(
          `HistoryPlugin Error in pre('findOneAndUpdate') hook for ${modelName}:`,
          error,
        );
        // Decide if the error should prevent the update or just be logged
        // return next(error); // Optionally pass error to stop operation
      }
      next();
    },
  );

  schema.post(
    "findOneAndUpdate",
    // Specify the expected result type (Document | null) and the Document type
    async function (
      this: QueryWithHistory<Document | null, Document>,
      doc: Document | null, // The document *after* the update
    ) {
      // Type 'this' to include _originalDoc
      const originalDoc = this._originalDoc; // Access the typed property
      // If no original doc was stored or the update didn't find/modify a doc, skip
      if (!originalDoc || !doc) return;

      await recordHistoryEntry<Document | null, Document>(
        "update",
        originalDoc,
        doc,
        this,
      );
    },
  );

  // Middleware for delete operations ('findOneAndDelete')
  schema.pre(
    "findOneAndDelete",
    // Specify the expected result type (Document | null) and the Document type
    async function (this: QueryWithHistory<Document | null, Document>, next) {
      // Type 'this' to include _originalDoc
      try {
        const docToDelete = await this.model
          .findOne(this.getQuery())
          .lean<Document>()
          .exec();
        if (docToDelete) {
          // Cast lean result if needed
          this._originalDoc = docToDelete as Document;
        }
      } catch (error) {
        logger.error(
          `HistoryPlugin Error in pre('findOneAndDelete') hook for ${modelName}:`,
          error,
        );
        // return next(error); // Optionally pass error to stop operation
      }
      next();
    },
  );

  schema.post(
    "findOneAndDelete",
    // Specify the expected result type (Document | null) and the Document type
    async function (
      this: QueryWithHistory<Document | null, Document>,
      doc: Document | null, // The document *before* it was deleted (Mongoose behavior)
    ) {
      // Type 'this' to include _originalDoc
      // Use the _originalDoc captured in the 'pre' hook as the definitive 'before' state
      const originalDoc = this._originalDoc;
      if (!originalDoc) return; // If no original doc was captured, skip

      await recordHistoryEntry<Document | null, Document>(
        "delete",
        originalDoc,
        null,
        this,
      );
    },
  );

  // Define the result type for deleteOne
  type DeleteOneResult = { acknowledged: boolean; deletedCount: number };

  // Middleware for 'deleteOne'
  schema.pre(
    "deleteOne",
    // Specify the expected result type (DeleteOneResult) and the Document type
    async function (this: QueryWithHistory<DeleteOneResult, Document>, next) {
      // Type 'this' to include _originalDoc
      try {
        const docToDelete = await this.model
          .findOne(this.getQuery())
          .lean<Document>()
          .exec();
        if (docToDelete) {
          // Cast lean result if needed
          this._originalDoc = docToDelete as Document;
        }
      } catch (error) {
        logger.error(
          `HistoryPlugin Error in pre('deleteOne') hook for ${modelName}:`,
          error,
        );
        // return next(error); // Optionally pass error to stop operation
      }
      next();
    },
  );

  schema.post(
    "deleteOne",
    // Specify the expected result type (DeleteOneResult) and the Document type
    async function (
      this: QueryWithHistory<DeleteOneResult, Document>,
      result: DeleteOneResult | null, // Result object from the delete operation
    ) {
      // Type 'this' to include _originalDoc
      const originalDoc = this._originalDoc; // Access the typed property

      // Check if an original doc was captured and if the delete operation was successful
      if (!originalDoc || !result || result.deletedCount === 0) return;

      await recordHistoryEntry<DeleteOneResult, Document>(
        "delete",
        originalDoc,
        null,
        this,
      );
    },
  );

  // Consider adding middleware for 'updateMany' and 'deleteMany' if necessary.
  // Note: Tracking individual document changes for 'many' operations is complex.
  // You might only record the query filter and the update/delete action itself,
  // rather than the 'before' and 'after' states of every affected document.

  // Interface for objects with toObject method
  interface WithToObject {
    toObject: () => Record<string, unknown>;
  }

  // Helper function to ensure we're working with plain objects
  function ensurePlainObject(obj: unknown): Record<string, unknown> {
    if (obj === null || typeof obj !== "object") {
      return {} as Record<string, unknown>;
    }

    // If it has a toObject method (like Mongoose documents), call it
    if (
      obj &&
      typeof obj === "object" &&
      "toObject" in obj &&
      typeof (obj as WithToObject).toObject === "function"
    ) {
      return (obj as WithToObject).toObject();
    }

    // Otherwise assume it's already a plain object
    return obj as Record<string, unknown>;
  }
}
