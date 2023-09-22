import {MailerService} from "@nestjs-modules/mailer";
import {Injectable, Logger} from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    to: string,
    cc: string,
    subject: string,
    mailText: string | null,
    html: string | null = null,
  ) {
    try {
      Logger.log("Sending email to: " + to, "Utils.sendMail");
      await this.mailerService.sendMail({
        to,
        ...(cc && {cc}),
        ...(subject && {subject}),
        ...(html && {html}),
        ...(mailText && {mailText}),
      });
    } catch (error) {
      Logger.error("Failed sending email to: " + to, "MailService.sendMail");
      Logger.error(error, "MailService.sendMail");
    }
  }
}
