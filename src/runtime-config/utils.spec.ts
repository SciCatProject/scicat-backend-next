import { reconcileData, isPlainObject } from "./utils";

describe("isPlainObject", () => {
  test("returns true for plain objects", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
  });

  test("returns false for arrays", () => {
    expect(isPlainObject([])).toBe(false);
  });

  test("returns false for null", () => {
    expect(isPlainObject(null)).toBe(false);
  });

  test("returns false for primitives", () => {
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject("x")).toBe(false);
    expect(isPlainObject(true)).toBe(false);
  });
});

describe("reconcileData", () => {
  //
  // PRIMITIVES
  //
  test("keeps DB primitive if present", () => {
    expect(reconcileData(99, 5)).toBe(99);
    expect(reconcileData("db", "src")).toBe("db");
    expect(reconcileData(true, false)).toBe(true);
  });

  test("creates primitive if target missing", () => {
    expect(reconcileData(undefined, 5)).toBe(5);
    expect(reconcileData(undefined, "x")).toBe("x");
    expect(reconcileData(undefined, null)).toBe(null);
  });

  //
  // OBJECTS
  //
  test("adds missing object keys", () => {
    const target = { a: 1 };
    const source = { a: 1, b: 2 };
    expect(reconcileData(target, source)).toEqual({ a: 1, b: 2 });
  });

  test("removes keys not in source", () => {
    const target = { a: 1, b: 2 };
    const source = { a: 1 };
    expect(reconcileData(target, source)).toEqual({ a: 1 });
  });

  test("keeps primitive values inside objects", () => {
    const target = { a: 1 };
    const source = { a: 999 }; // different primitive
    expect(reconcileData(target, source)).toEqual({ a: 1 }); // preserved DB value
  });

  test("creates nested primitives when missing", () => {
    const target = {};
    const source = { a: { b: 10 } };
    expect(reconcileData(target, source)).toEqual({ a: { b: 10 } });
  });

  test("preserves nested DB values", () => {
    const target = { a: { b: 777 } };
    const source = { a: { b: 10 } };
    expect(reconcileData(target, source)).toEqual({ a: { b: 777 } });
  });

  test("removes nested keys", () => {
    const target = { a: { b: 1, c: 2 } };
    const source = { a: { b: 1 } };
    expect(reconcileData(target, source)).toEqual({ a: { b: 1 } });
  });

  //
  // ARRAYS
  //
  test("syncs array structure but keeps DB primitive values inside", () => {
    const target = [100, 200];
    const source = [1, 2];
    expect(reconcileData(target, source)).toEqual([100, 200]);
  });

  test("creates array primitives when missing", () => {
    const target: unknown[] = [];
    const source = [1, 2, 3];
    expect(reconcileData(target, source)).toEqual([1, 2, 3]);
  });

  test("removes extra array elements", () => {
    const target: unknown[] = [1, 2, 3];
    const source = [1];
    expect(reconcileData(target, source)).toEqual([1]);
  });

  test("preserves nested array object values", () => {
    const target = [{ a: 999 }];
    const source = [{ a: 5 }];
    expect(reconcileData(target, source)).toEqual([{ a: 999 }]);
  });

  test("syncs nested array objects and removes extra keys", () => {
    const target = [{ a: 1, old: true }];
    const source = [{ a: 2 }];
    expect(reconcileData(target, source)).toEqual([{ a: 1 }]); // a kept, old removed
  });

  //
  // COMPLEX FULL STRUCTURE SYNC
  //
  test("deep complex structure sync", () => {
    const target = {
      type: "attachments",
      label: "Gallery",
      order: 99, // overridden by preserve rule → keep 99
      options: {
        limit: 5,
        size: "large",
      },
      oldKey: true,
    };

    const source = {
      type: "attachments",
      label: "Gallery",
      order: 5,
      options: {
        limit: 2, // keep DB = 5
      },
    };

    expect(reconcileData(target, source)).toEqual({
      type: "attachments",
      label: "Gallery",
      order: 99, // preserved
      options: {
        limit: 5, // preserved
      },
      // size removed
      // oldKey removed
    });
  });
});
