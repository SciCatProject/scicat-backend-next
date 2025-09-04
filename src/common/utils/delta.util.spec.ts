import { computeDeltaWithOriginals } from "./delta.util";

describe("Delta Calculation Utility", () => {
  it("should detect changes in primitive values", () => {
    const oldObject = { name: "Original name" };
    const newObject = { name: "Updated name" };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({ name: "Updated name" });
    expect(result.originals).toEqual({ name: "Original name" });
  });

  it("should NOT nullify complex objects when not included in update", () => {
    const oldObject = {
      description: "Original description",
      sampleCharacteristics: {
        description: "Sample characteristics",
      },
    };

    const newObject = {
      description: "Updated description",
      // sampleCharacteristics is intentionally not included
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    // Check that delta only includes what changed
    expect(result.delta).toEqual({
      description: "Updated description",
    });

    // Check that sampleCharacteristics was NOT nullified
    expect(result.delta.sampleCharacteristics).toBeUndefined();
  });

  it("should still mark primitives as removed when not included in update", () => {
    const oldObject = {
      description: "Original description",
      tags: "tag1",
    };

    const newObject = {
      description: "Updated description",
      // tags is intentionally not included
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({
      description: "Updated description",
      tags: null,
    });
    expect(result.originals).toEqual({
      description: "Original description",
      tags: "tag1",
    });
  });

  it("should still mark arrays as removed when not included in update", () => {
    const oldObject = {
      description: "Original description",
      tags: ["tag1", "tag2"],
    };

    const newObject = {
      description: "Updated description",
      // tags is intentionally not included
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({
      description: "Updated description",
      tags: null,
    });
  });

  it("should handle nested object changes", () => {
    const oldObject = {
      metadata: {
        author: "John",
        version: 1,
      },
    };

    const newObject = {
      metadata: {
        author: "Jane",
        version: 1,
      },
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({
      metadata: {
        author: "Jane",
      },
    });

    expect(result.originals).toEqual({
      metadata: {
        author: "John",
      },
    });
  });

  it("should handle null and undefined values correctly", () => {
    const oldObject = {
      field1: null,
      field2: "value",
    };

    const newObject = {
      field1: "new value",
      field2: undefined,
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({
      field1: "new value",
      field2: null,
    });

    expect(result.originals).toEqual({
      field1: null,
      field2: "value",
    });
  });

  // Add these tests to your existing test suite
  it("should handle Date objects correctly", () => {
    const oldDate = new Date("2025-01-01");
    const newDate = new Date("2025-02-01");

    const oldObject = { createdAt: oldDate };
    const newObject = { createdAt: newDate };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({ createdAt: newDate });
    expect(result.originals).toEqual({ createdAt: oldDate });
  });

  it("should ignore _id and __v fields", () => {
    const oldObject = {
      _id: "123456789",
      __v: 0,
      title: "Original title",
    };

    const newObject = {
      _id: "123456789",
      __v: 1,
      title: "New title",
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({ title: "New title" });
    expect(result.originals).toEqual({ title: "Original title" });
    expect(result.delta._id).toBeUndefined();
    expect(result.delta.__v).toBeUndefined();
  });

  it("should handle empty objects correctly", () => {
    const oldObject = { metadata: {} };
    const newObject = { metadata: { author: "John" } };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({ metadata: { author: "John" } });
    expect(result.originals).toEqual({ metadata: {} });
  });

  it("should handle arrays with objects correctly", () => {
    const oldObject = {
      items: [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ],
    };

    const newObject = {
      items: [
        { id: 1, name: "Item 1 Updated" },
        { id: 2, name: "Item 2" },
      ],
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({ items: newObject.items });
    expect(result.originals).toEqual({ items: oldObject.items });
  });

  it("should correctly handle deeply nested objects with null values", () => {
    const oldObject = {
      metadata: {
        details: {
          location: "Building A",
          contact: null,
        },
      },
    };

    const newObject = {
      metadata: {
        details: {
          location: "Building B",
          contact: { name: "John", email: "john@example.com" },
        },
      },
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({
      metadata: {
        details: {
          location: "Building B",
          contact: { name: "John", email: "john@example.com" },
        },
      },
    });
  });

  it("should handle transitions between primitive types and objects", () => {
    const oldObject = {
      data: "string value",
    };

    const newObject = {
      data: { key: "value" },
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({ data: { key: "value" } });
    expect(result.originals).toEqual({ data: "string value" });
  });

  it("should handle explicitly set null values", () => {
    const oldObject = {
      title: "Original title",
      description: "Original description",
      metadata: { author: "John" },
    };

    const newObject = {
      title: "Updated title",
      description: null, // Explicitly set to null
      metadata: { author: "Jane" },
    };

    const result = computeDeltaWithOriginals(oldObject, newObject);

    expect(result.delta).toEqual({
      title: "Updated title",
      description: null,
      metadata: { author: "Jane" },
    });
  });
});
