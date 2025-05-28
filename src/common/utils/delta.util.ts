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

  // Check for keys that were present in oldObject but removed in newObject
  Object.keys(oldObject).forEach((key) => {
    if (!(key in newObject) && key !== "_id" && key !== "__v") {
      delta[key] = null;
      originals[key] = oldObject[key];
    }
  });

  return { delta, originals };
}
