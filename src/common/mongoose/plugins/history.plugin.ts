import { ConfigService } from "@nestjs/config";
import { Document, QueryWithHelpers, Schema } from "mongoose"; // Import QueryWithHelpers
import {
  GenericHistory,
  GenericHistoryDocument,
} from "../../schemas/generic-history.schema";
import { computeDeltaWithOriginals } from "../../utils/delta.util";

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
    modelName: optionsModelName, // Extract modelName if provided in options
    getActiveUser: getActiveUser,
    configService,
    // Extract from options with fallbacks to ConfigService values
    trackableStrategy: explicitStrategy,
    trackables: explicitTrackables,
  } = options;

  // Use options if provided, otherwise try ConfigService, then fall back to defaults
  const trackableStrategy =
    explicitStrategy ??
    (configService?.get<string>("trackableStrategy") === "delta"
      ? "delta"
      : "document");

  const trackables =
    explicitTrackables ?? configService?.get<string[]>("trackables") ?? [];

  // Get the model name from options
  if (!optionsModelName) {
    // If not provided, warn and skip setup
    console.warn(
      "HistoryPlugin: Could not determine model name for schema. Please provide a modelName in plugin options.",
    );
    return; // Skip setup if we can't determine the model name
  }

  const modelName = optionsModelName;

  // Skip setting up the plugin if the model is not trackable
  if (!trackables.includes(modelName)) {
    return;
  }
  console.log(`History tracking enabled for model: ${modelName}`);

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
        console.error(
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

      // Ensure the History model is available
      const HistoryModel =
        this.model.db.model<GenericHistoryDocument>(historyModelName);
      if (!HistoryModel) {
        console.error(
          `HistoryPlugin Error: History model "${historyModelName}" not found.`,
        );
        return;
      }

      const user = getActiveUser ? getActiveUser() : undefined;

      let beforeData, afterData;

      // For document stategy: store the whole document
      if (trackableStrategy === "document") {
        beforeData = originalDoc;
        afterData = doc.toObject(); // Convert to plain object
      } else {
        const docObj = doc.toObject();

        // Use the ensurePlainObject function to ensure we're working with plain objects
        const plainOriginalDoc = ensurePlainObject(originalDoc);

        // Use the function that returns both delta and originals
        const { delta, originals } = computeDeltaWithOriginals(
          plainOriginalDoc,
          docObj,
        );

        // Use the computed values - uncomment below if the _id should be included
        beforeData = originals;
        afterData = delta;

        // Ensure _id is in the after data
        //afterData._id = docObj._id;
      }

      try {
        await HistoryModel.create({
          collectionName: modelName, // modelName is accessible here due to closure
          documentId: originalDoc._id, // _id should exist on the lean object/document
          before: beforeData, // originalDoc might be a plain object from lean()
          after: afterData, // Use toObject() for plain JS object representation of the updated doc
          operation: "update",
          user: user,
          // timestamp is added automatically by Mongoose { timestamps: { createdAt: "timestamp" } }
        });
      } catch (error) {
        // Log error but don't block the main operation flow
        console.error(
          `HistoryPlugin Error (post 'findOneAndUpdate') for ${modelName}:`,
          error,
        );
      }
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
        console.error(
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

      const HistoryModel =
        this.model.db.model<GenericHistoryDocument>(historyModelName);
      if (!HistoryModel) {
        console.error(
          `HistoryPlugin Error: History model "${historyModelName}" not found.`,
        );
        return;
      }
      const user = getActiveUser ? getActiveUser() : undefined;
      console.log("User (originator):", user);

      try {
        await HistoryModel.create({
          collectionName: modelName, // modelName is accessible here
          documentId: originalDoc._id,
          before: originalDoc, // originalDoc is the state before deletion, always store the complete document
          after: null, // Indicate deletion
          operation: "delete",
          user: user,
          // timestamp is added automatically
        });
      } catch (error) {
        console.error(
          `HistoryPlugin Error (post 'findOneAndDelete') for ${modelName}:`,
          error,
        );
      }
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
        console.error(
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

      const HistoryModel =
        this.model.db.model<GenericHistoryDocument>(historyModelName);
      if (!HistoryModel) {
        console.error(
          `HistoryPlugin Error: History model "${historyModelName}" not found.`,
        );
        return;
      }
      const user = getActiveUser ? getActiveUser() : undefined;
      console.log("User (originator):", user);

      try {
        await HistoryModel.create({
          collectionName: modelName, // modelName is accessible here
          documentId: originalDoc._id,
          before: originalDoc, // originalDoc is the state before deletion, always store the complete document
          after: null, // Indicate deletion
          operation: "delete",
          user: user,
          // timestamp is added automatically
        });
      } catch (error) {
        console.error(
          `HistoryPlugin Error (post 'deleteOne') for ${modelName}:`,
          error,
        );
      }
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
