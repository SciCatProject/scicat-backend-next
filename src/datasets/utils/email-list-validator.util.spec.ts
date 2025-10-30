import { CustomEmailList } from "./email-list-validator.util";
import { ValidationArguments } from "class-validator";

describe("CustomEmailList", () => {
  const validator = new CustomEmailList();
  const dummyArgs = {} as ValidationArguments;

  it("accepts a single valid email", () => {
    expect(validator.validate("user@example.com", dummyArgs)).toBe(true);
  });

  it("accepts multiple valid emails separated by semicolons", () => {
    expect(validator.validate("a@x.com; b@y.org; c@z.net", dummyArgs)).toBe(
      true,
    );
  });

  it("rejects if any email is invalid", () => {
    expect(validator.validate("a@x.com; notanemail; c@z.net", dummyArgs)).toBe(
      false,
    );
  });

  it("rejects empty string", () => {
    expect(validator.validate("", dummyArgs)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(validator.validate(undefined as unknown as string, dummyArgs)).toBe(
      false,
    );
  });

  it("rejects string with extra semicolons", () => {
    expect(validator.validate("a@x.com;;b@y.org", dummyArgs)).toBe(false);
  });

  it("returns descriptive defaultMessage", () => {
    const msg = validator.defaultMessage({
      value: "foo",
    } as ValidationArguments);
    expect(msg).toContain("foo");
  });
});
