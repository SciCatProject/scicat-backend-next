import { Document, QueryWithHelpers, Schema } from "mongoose"; // Import QueryWithHelpers
import {
  GenericHistory,
  GenericHistoryDocument,
} from "../../schemas/generic-history.schema";
import { computeDeltaWithOriginals } from "../../utils/delta.util";
import { Logger } from "@nestjs/common";

/**
 * Configuration options for the history plugin.
 *
 * @interface HistoryPluginOptions
 * @property {string} [historyModelName] - Name of the model to store history records (defaults to GenericHistory)
 * @property {string} [modelName] - Name of the model being tracked (required)
 * @property {Function} [getActiveUser] - Function that returns the current username from request context
 * @property {ConfigService} [configService] - NestJS ConfigService to access environment variables
 * @property {"delta" | "document"} [trackableStrategy] - Strategy for storing history (full document or just changes)
 * @property {string[]} [trackables] - List of model names that should be tracked
 */
interface HistoryPluginOptions {
  historyModelName?: string;
  modelName?: string;
  getActiveUser?: () => string | undefined; // Function to get current user context if needed
  // Add these two new options
  trackableStrategy?: "delta" | "document";
  trackables?: string[];
}

/**
 * Extended interface for Mongoose queries to store original documents during operations.
 * This allows tracking document state before operations for history comparison.
 *
 * @interface QueryWithHistory
 * @extends QueryWithHelpers
 * @template Res - The result type of the query operation
 * @template T - The document type being operated on
 * @property {T | (T & Document<unknown, object, T>[]) | null} [_originalDoc] - Original document state
 */
interface QueryWithHistory<
  Res, // Result type of the query (e.g., T | null, DeleteResult)
  T extends Document, // Document type
> extends QueryWithHelpers<Res, T, object> {
  // Use object for THelpers
  _originalDoc?: T | (T & Document<unknown, object, T>[]) | null; // Store the original doc(s) fetched
}

/**
 * Mongoose plugin that automatically tracks document changes for audit history.
 *
 * The plugin intercepts document operations (update, delete) and records the
 * before and after states to a history collection. It supports two tracking strategies:
 * - 'document': Stores complete document snapshots
 * - 'delta': Stores only the changed fields (more storage efficient)
 *
 * @param {Schema} schema - The Mongoose schema to apply history tracking to
 * @param {HistoryPluginOptions} options - Plugin configuration options
 *
 * @example
 * ```typescript
 * // Apply to a schema during module initialization
 * schema.plugin(historyPlugin, {
 *   historyModelName: GenericHistory.name,
 *   modelName: "Dataset",
 *   configService: configService,
 *   getActiveUser: () => getCurrentUsername()
 * });
 * ```
 */
export function historyPlugin(
  schema: Schema,
  options: HistoryPluginOptions = {},
) {
  const {
    historyModelName = GenericHistory.name,
    modelName,
    getActiveUser,
    trackableStrategy,
  } = options;
  const recordHistoryEntry = async <T, U extends Document>(
    operation: "update" | "delete",
    originalDoc: Document,
    updatedDoc: Document | null,
    context: QueryWithHistory<T, U>,
  ): Promise<void> => {
    if (!originalDoc) {
      return;
    }

    try {
      // Get the history model using the context to maintain proper connection
      const HistoryModel =
        context.model.db.model<GenericHistoryDocument>(historyModelName);
      if (!HistoryModel) {
        Logger.error(
          `HistoryPlugin Error: History model "${historyModelName}" not found.`,
        );
        return;
      }

      const user = getActiveUser ? getActiveUser() : undefined;

      let beforeData, afterData;

      // ---------------------------------------------
      // Determine the strategy for tracking changes
      // ---------------------------------------------
      if (trackableStrategy === "document") {
        // Document strategy - store full document
        beforeData = originalDoc;
        afterData = updatedDoc ? updatedDoc.toObject() : null;
        //----------------------------------------------
      } else if (trackableStrategy === "delta") {
        // -----------------------------------------------
        // Delta strategy - store only the changes
        // -----------------------------------------------
        if (updatedDoc) {
          // -----------------------------------------------
          // Ensure updatedDoc is not null
          // Ensure both documents are plain objects
          // -----------------------------------------------
          const docObj = updatedDoc.toObject();
          const plainOriginalDoc = ensurePlainObject(originalDoc);

          // Compute the difference
          // This function should return both the delta and the original values
          const { delta, originals } = computeDeltaWithOriginals(
            plainOriginalDoc,
            docObj,
          );

          // Store the delta and the original values
          beforeData = originals;
          afterData = delta;
        } else {
          // If updatedDoc is null, we assume the document was deleted
          beforeData = originalDoc;
          afterData = null;
        }
      } else {
        // Fallback for unknown strategy
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
      Logger.error(
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
        Logger.error(
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
        Logger.error(
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
    async function (this: QueryWithHistory<Document | null, Document>) {
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
        Logger.error(
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
  const ensurePlainObject = (obj: unknown): Record<string, unknown> => {
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
  };
}
