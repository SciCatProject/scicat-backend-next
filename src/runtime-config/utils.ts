export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const reconcileData = (target: unknown, source: unknown): unknown => {
  // Primitives: keep existing DB value if present; only create new values if DB has none.
  if (typeof source !== "object" || source === null) {
    return target !== undefined ? target : source;
  }

  // Arrays: match array length and structure, but don't overwrite primitive values
  if (Array.isArray(source)) {
    const tgtArr: unknown[] = Array.isArray(target) ? target : [];

    return source.map((srcItem, index) => {
      const tgtItem = tgtArr[index] as unknown;
      return reconcileData(tgtItem, srcItem);
    });
  }

  // Objects: sync keys
  if (isPlainObject(source)) {
    const result: Record<string, unknown> = {};

    const srcObj = source as Record<string, unknown>;
    const tgtObj = isPlainObject(target)
      ? (target as Record<string, unknown>)
      : {};

    // update keys
    for (const key of Object.keys(srcObj)) {
      const nextTarget = key in tgtObj ? tgtObj[key] : undefined;
      result[key] = reconcileData(nextTarget, srcObj[key]);
    }

    return result;
  }

  return source;
};
