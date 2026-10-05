/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Migration: Add optional ID fields (proposalIds, sampleIds, instrumentIds) to PublishedData
 * 
 * Purpose: 
 * - Make datasetPids optional (previously required)
 * - Add new optional ID fields: proposalIds, sampleIds, instrumentIds
 * - All ID fields will have empty array defaults
 * 
 * This migration ensures backward compatibility with existing documents
 * that have the required datasetPids field.
 */

module.exports = {
  async up(db, client) {
    // Add new optional ID fields to documents that don't have them
    const result = await db
      .collection("PublishedData")
      .updateMany(
        {
          $or: [
            { proposalIds: { $exists: false } },
            { sampleIds: { $exists: false } },
            { instrumentIds: { $exists: false } },
          ],
        },
        {
          $set: {
            proposalIds: [],
            sampleIds: [],
            instrumentIds: [],
          },
        },
      );

    console.log(
      `Migration completed: Added optional ID fields to ${result.modifiedCount} PublishedData documents`,
    );

    // For documents that already have some of the new fields, ensure all are present
    const partialResult = await db
      .collection("PublishedData")
      .updateMany(
        {
          $and: [
            { proposalIds: { $exists: true } },
            { sampleIds: { $exists: true } },
            { instrumentIds: { $exists: true } },
            {
              $or: [
                { proposalIds: { $exists: false } },
                { sampleIds: { $exists: false } },
                { instrumentIds: { $exists: false } },
              ],
            },
          ],
        },
        {
          $set: {
            proposalIds: { $ifNull: ["$proposalIds", []] },
            sampleIds: { $ifNull: ["$sampleIds", []] },
            instrumentIds: { $ifNull: ["$instrumentIds", []] },
          },
        },
      );

    console.log(
      `Migration completed: Normalized ID fields for ${partialResult.modifiedCount} PublishedData documents with partial fields`,
    );

    // Verify the migration
    const countWithAllFields = await db
      .collection("PublishedData")
      .countDocuments({
        proposalIds: { $exists: true },
        sampleIds: { $exists: true },
        instrumentIds: { $exists: true },
      });

    const totalCount = await db.collection("PublishedData").countDocuments({});

    console.log(
      `Verification: ${countWithAllFields}/${totalCount} documents have all ID fields`,
    );

    return {
      modifiedCount: result.modifiedCount + partialResult.modifiedCount,
      totalDocuments: totalCount,
      documentsWithAllFields: countWithAllFields,
    };
  },

  async down(db, client) {
    // Rollback: Remove the new ID fields and restore datasetPids as required
    // Note: This rollback will NOT restore the required nature of datasetPids
    // in the schema - that requires manual schema update
    const result = await db
      .collection("PublishedData")
      .updateMany(
        {},
        {
          $unset: {
            proposalIds: "",
            sampleIds: "",
            instrumentIds: "",
          },
        },
      );

    console.log(
      `Rollback completed: Removed optional ID fields from ${result.modifiedCount} PublishedData documents`,
    );

    return {
      modifiedCount: result.modifiedCount,
    };
  },
};
