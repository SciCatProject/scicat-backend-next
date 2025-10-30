import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isEmail,
} from "class-validator";

@ValidatorConstraint({ name: "customEmailList", async: false })
export class CustomEmailList implements ValidatorConstraintInterface {
  extractEmails(text: string): string[] {
    return text.split(";").map((e) => e.trim());
  }

  validate(text: string, _: ValidationArguments) {
    if (!text) return false;
    const emails = this.extractEmails(text);
    return emails.every((e) => isEmail(e));
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `Expected an email or a list of semicolon separated emails, got ${args.value}`;
  }
}
