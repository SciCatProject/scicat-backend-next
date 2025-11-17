import { isEqual } from "lodash";

export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const reconcileData = (target: unknown, source: unknown): unknown => {
  // Primitives → keep existing DB value if present; only create new values if DB has none.
  if (typeof source !== "object" || source === null) {
    return target !== undefined ? target : source;
  }

  // Arrays → match array length and structure, but don't overwrite primitive values
  if (Array.isArray(source)) {
    const tgtArr: unknown[] = Array.isArray(target) ? target : [];

    return source.map((srcItem, index) => {
      console.log("srcItem,index", srcItem, index);
      const tgtItem = tgtArr[index];
      return reconcileData(tgtItem, srcItem);
    });
  }

  // Objects → sync keys
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

export const diffChanges = (
  oldValue: unknown,
  newValue: unknown,
  path: string[] = [],
  out: string[] = [],
): string[] => {
  const fullPath = path.join(".");

  // ----------------------------------------
  // PRIMITIVES
  // ----------------------------------------
  if (
    typeof oldValue !== "object" ||
    oldValue === null ||
    typeof newValue !== "object" ||
    newValue === null
  ) {
    if (!isEqual(oldValue, newValue)) {
      out.push(
        `${fullPath}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`,
      );
    }
    return out;
  }

  // ----------------------------------------
  // ARRAYS
  // ----------------------------------------
  if (Array.isArray(newValue)) {
    const oldArr = Array.isArray(oldValue) ? oldValue : [];
    if (!isEqual(oldArr, newValue)) {
      out.push(`${fullPath}: array changed`);
    }
    return out;
  }

  // ----------------------------------------
  // OBJECTS
  // ----------------------------------------
  const oldObj = oldValue as Record<string, unknown>;
  const newObj = newValue as Record<string, unknown>;

  // added keys
  for (const key of Object.keys(newObj)) {
    if (!(key in oldObj)) {
      out.push(`${fullPath}.${key} added`);
    }
  }

  // removed keys
  for (const key of Object.keys(oldObj)) {
    if (!(key in newObj)) {
      out.push(`${fullPath}.${key} removed`);
    }
  }

  // modified keys
  for (const key of Object.keys(newObj)) {
    if (key in oldObj) {
      diffChanges(oldObj[key], newObj[key], [...path, key], out);
    }
  }

  return out;
};
