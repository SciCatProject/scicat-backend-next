/**
 * Computes both the delta between two objects and extracts the original values of changed fields.
 * @param oldObject The original object.
 * @param newObject The modified object.
 * @returns An object containing the delta and the original values of changed fields.
 */
export function computeDeltaWithOriginals(
  oldObject: Record<string, unknown>,
  newObject: Record<string, unknown>,
): {
  delta: Record<string, unknown>;
  originals: Record<string, unknown>;
} {
  const delta: Record<string, unknown> = {};
  const originals: Record<string, unknown> = {}; // No longer include _id here

  // Process all keys in the new object
  Object.keys(newObject).forEach((key) => {
    // Skip _id field and __v field
    if (key === "_id" || key === "__v") {
      return;
    }

    const oldValue = oldObject[key];
    const newValue = newObject[key];

    // Handle explicit undefined values - treat them as field removals
    if (newValue === undefined) {
      delta[key] = null; // Convert undefined to null in the delta
      originals[key] = oldValue;
      return;
    }

    // Handle nested objects recursively (but not arrays or null values)
    if (
      oldValue !== null &&
      newValue !== null &&
      typeof oldValue === "object" &&
      typeof newValue === "object" &&
      !Array.isArray(oldValue) &&
      !Array.isArray(newValue) &&
      !(oldValue instanceof Date) &&
      !(newValue instanceof Date)
    ) {
      const result = computeDeltaWithOriginals(
        oldValue as Record<string, unknown>,
        newValue as Record<string, unknown>,
      );

      if (Object.keys(result.delta).length > 0) {
        delta[key] = result.delta;
        originals[key] = result.originals;
      }
    }
    // For non-objects, arrays, or Date objects, compare with JSON.stringify
    else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      delta[key] = newValue;
      originals[key] = oldValue;
    }
  });

  // Don't mark object fields as null if they're simply not included in the update
  Object.keys(oldObject).forEach((key) => {
    if (!(key in newObject) && key !== "_id" && key !== "__v") {
      // Check if the field is an object (but not array or null)
      const oldValue = oldObject[key];
      if (
        oldValue === null ||
        typeof oldValue !== "object" ||
        Array.isArray(oldValue) ||
        oldValue instanceof Date
      ) {
        // For primitives, arrays, and dates, keep the existing behavior
        delta[key] = null;
        originals[key] = oldValue;
      }
      // For complex objects like sampleCharacteristics, don't mark as null
      // when they are simply not included in the update
    }
  });

  return { delta, originals };
}
