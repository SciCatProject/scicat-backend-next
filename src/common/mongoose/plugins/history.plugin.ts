import { Schema, Document, Model, Query, QueryWithHelpers } from "mongoose"; // Import QueryWithHelpers
import {
  GenericHistory,
  GenericHistoryDocument,
} from "../../schemas/generic-history.schema";

interface HistoryPluginOptions {
  historyModelName?: string;
  trackables?: string[];
  getCurrentUser?: () => string | undefined; // Function to get current user context if needed
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
    historyModelName = GenericHistory.name, // Use the new GenericHistory model name
    trackables = (process.env.TRACKABLES?.split(",") || []).map((t) =>
      t.trim(),
    ),
    getCurrentUser, // Optional function to get user context
  } = options;

  // Get the name of the model this schema is attached to
  // Note: This relies on how NestJS names models or how the schema is configured.
  const modelName = schema.get("collection"); // Mongoose stores collection name here

  if (!modelName) {
    console.warn(
      "HistoryPlugin: Could not determine model name for schema. Tracking might not work correctly.",
    );
    // If modelName is crucial and cannot be determined, maybe stop plugin application
    return;
  }

  const shouldTrack = trackables.includes(modelName);

  if (!shouldTrack) {
    // console.log(`History tracking disabled for model: ${modelName}`);
    return; // Skip setting up the plugin if the model is not trackable
  }

  console.log(`History tracking enabled for model: ${modelName}`);

  // Middleware for update operations ('findOneAndUpdate')
  schema.pre(
    "findOneAndUpdate",
    // Specify the expected result type (Document | null) and the Document type
    async function (this: QueryWithHistory<Document | null, Document>, next) {
      // Type 'this' to include _originalDoc
      try {
        // Use lean() to get a plain object, which is often better for history tracking
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

      const user = getCurrentUser ? getCurrentUser() : undefined;

      try {
        await HistoryModel.create({
          collectionName: modelName, // modelName is accessible here due to closure
          documentId: originalDoc._id, // _id should exist on the lean object/document
          before: originalDoc, // originalDoc might be a plain object from lean()
          after: doc.toObject(), // Use toObject() for plain JS object representation of the updated doc
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
      const user = getCurrentUser ? getCurrentUser() : undefined;

      try {
        await HistoryModel.create({
          collectionName: modelName, // modelName is accessible here
          documentId: originalDoc._id,
          before: originalDoc, // originalDoc is the state before deletion
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
      const user = getCurrentUser ? getCurrentUser() : undefined;

      try {
        await HistoryModel.create({
          collectionName: modelName, // modelName is accessible here
          documentId: originalDoc._id,
          before: originalDoc, // originalDoc is the state before deletion
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
}
