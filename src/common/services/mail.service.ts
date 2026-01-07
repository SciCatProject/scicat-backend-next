import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { isAxiosError } from "@nestjs/terminus/dist/utils";
import { SentMessageInfo } from "nodemailer";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

/**
 * Service for sending emails using nodemailer.
 *
 * Use this rather than MailerService directly to allow configuration in AppModule
 */
@Injectable()
export class MailService {

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

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
    const emailTemplates = this.configService.get("emailTemplate")
    if (emailTemplates) {      
      const subject = emailTemplates.subject.replace("{doi}", doi);
      const body = emailTemplates.body.replace("{doi}", doi).replace("{userEmail}", userEmail);
      return { subject, body };
    } else {
      Logger.warn(`No template found for ${templateName}.`);
      }
    return null; // Return null if no template is found or config is missing
  }

  // Send email based on the template name, only if template exists
  async sendTemplateEmail(templateName: string, doi: string, userEmail: string): Promise<void> {
    const emailContent = this.configService.get("emailTemplate");
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
