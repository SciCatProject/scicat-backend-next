import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { SentMessageInfo } from "nodemailer";

/**
 * Service for sending emails using nodemailer.
 *
 * Use this rather than MailerService directly to allow configuration in AppModule
 */
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: ISendMailOptions): Promise<SentMessageInfo> {
    try {
      Logger.log("Sending email to: " + options.to, "Utils.sendMail");
      await this.mailerService.sendMail(options);
    } catch (error) {
      Logger.error(
        "Failed sending email to: " + options.to,
        "MailService.sendMail",
      );
      Logger.error(error, "MailService.sendMail");
    }
  }
}
