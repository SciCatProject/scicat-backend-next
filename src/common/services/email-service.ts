import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { EmailConfigService } from "./email-config.service";

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly emailConfigService: EmailConfigService) {
    // Initialize the email transporter
    this.transporter = nodemailer.createTransport({
      service: "gmail", // Example using Gmail, can be customized
      auth: {
        user: process.env.EMAIL_USER, // Your email (e.g., Gmail)
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
  }

  // Method to generate email content based on DOI
  getEmailContent(doi: string): { subject: string; body: string } | null {
    // Fetch the template if available
    const template = this.emailConfigService.getTemplate("DOI_REGISTERED");

    if (template) {
      const subject = template.subject.replace("{doi}", doi);
      const body = template.body.replace("{doi}", doi);
      return { subject, body };
    }

    return null; // If no template is found, return null
  }
}
