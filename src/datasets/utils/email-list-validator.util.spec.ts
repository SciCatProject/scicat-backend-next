import { CustomEmailList } from "./email-list-validator.util";
import { ValidationArguments } from "class-validator";

describe("CustomEmailList", () => {
  const validator = new CustomEmailList();

  it("accepts a single valid email", () => {
    expect(validator.validate("user@example.com")).toBe(true);
  });

  it("accepts multiple valid emails separated by semicolons", () => {
    expect(validator.validate("a@x.com; b@y.org; c@z.net")).toBe(true);
  });

  it("rejects if any email is invalid", () => {
    expect(validator.validate("a@x.com; notanemail; c@z.net")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validator.validate("")).toBe(false);
  });

  it("rejects undefined", () => {
    expect(validator.validate(undefined as unknown as string)).toBe(false);
  });

  it("rejects string with extra semicolons", () => {
    expect(validator.validate("a@x.com;;b@y.org")).toBe(false);
  });

  it("returns descriptive defaultMessage", () => {
    const msg = validator.defaultMessage({
      value: "foo",
    } as ValidationArguments);
    expect(msg).toContain("foo");
  });
});
