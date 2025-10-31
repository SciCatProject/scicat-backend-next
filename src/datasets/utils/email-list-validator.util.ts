import { Injectable } from "@nestjs/common";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isEmail,
} from "class-validator";

@Injectable()
@ValidatorConstraint({ name: "customEmailList", async: false })
export class CustomEmailList implements ValidatorConstraintInterface {
  static readonly SEPARATOR = ";";

  splitEmails(text: string): string[] {
    return text.split(CustomEmailList.SEPARATOR).map((e) => e.trim());
  }

  joinEmails(emails: string[]): string {
    return emails.join(`${CustomEmailList.SEPARATOR} `);
  }

  validate(text: string) {
    if (!text) return false;
    const emails = this.splitEmails(text);
    return emails.every((e) => isEmail(e));
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `Expected an email or a list of semicolon separated emails, got ${args.value}`;
  }
}
