import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { isAxiosError } from "@nestjs/terminus/dist/utils";
import { SentMessageInfo } from "nodemailer";
import { EmailConfigService } from "./email-config.service";
import * as fs from "fs";
import * as path from "path";

/**
 * Service for sending emails using nodemailer.
 *
 * Use this rather than MailerService directly to allow configuration in AppModule
 */
@Injectable()
export class MailService {

  private readonly emailTemplatesConfig: Record<string, any> | null;
  constructor(private readonly mailerService: MailerService) {
    // Load email templates configuration from file on initialization
    this.emailTemplatesConfig = this.loadEmailTemplatesConfig();
  }
  // Load email templates configuration file (email-templates.json)
  private loadEmailTemplatesConfig(): Record<string, any> | null {
    const configFilePath = path.join(__dirname, "email-templates.json");

    // Check if the email templates file exists
    if (fs.existsSync(configFilePath)) {
      const configFile = fs.readFileSync(configFilePath, "utf-8");
      return JSON.parse(configFile);
    }
  
    Logger.warn("No email templates configuration found (email-templates.json).");
    return null;
  }

  async sendMail(options: ISendMailOptions): Promise<SentMessageInfo> {
    try {
      Logger.log("Sending email to: " + options.to, "Utils.sendMail");
      await this.mailerService.sendMail(options);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response) {
          Logger.error(`Error sending email. Got ${error.response.status}.`);
          Logger.error(
            `Error response data: ${JSON.stringify(error.response.data)}`,
          );
        } else if (error.request) {
          Logger.error(`Error sending email. No response received.`);
        } else {
          Logger.error(
            "Error sending email. Unable to set up request: " + error.message,
          );
        }
      } else {
        Logger.error(
          `Failed sending email to: ${options.to}`,
          "MailService.sendMail",
        );
        Logger.error(error, "MailService.sendMail");
      }
    }
  }
  // Fetch the email content for a template from the configuration
  getEmailContent(templateName: string, doi: string, userEmail: string): { subject: string; body: string } | null {
  if (this.emailTemplatesConfig) {
      const template = this.emailTemplatesConfig[templateName];

      if (template) {
        const subject = template.subject.replace("{doi}", doi);
        const body = template.body.replace("{doi}", doi).replace("{userEmail}", userEmail);
        return { subject, body };
      } else {
        Logger.warn(`No template found for ${templateName}.`);
      }
    }
    return null; // Return null if no template is found or config is missing
  }

  // Send email based on the template name, only if template exists
  async sendTemplateEmail(templateName: string, doi: string, userEmail: string): Promise<void> {
    const emailContent = this.getEmailContent(templateName, doi, userEmail);

  if (emailContent) {
      // Prepare the email options
      const mailOptions: ISendMailOptions = {
        to: userEmail, // Recipient email (the logged-in user's email)
        subject: emailContent.subject,
        text: emailContent.body,
      };
      
      // Send the email
      await this.sendMail(mailOptions);
    } else {
      Logger.warn(`Skipping email sending for template ${templateName} as no template was found.`);
    }
  }
}
