/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 *
 */
import { Logger, NotFoundException } from "@nestjs/common";
import { JobAction } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";
import { createTransport, Transporter } from "nodemailer";
import { compile, TemplateDelegate } from "handlebars";

/**
 * Send an email following a job
 */
export class EmailJobAction<T> implements JobAction<T> {
  public static readonly actionType = "email";
  private mailerDetails;

  getActionType(): string {
    return EmailJobAction.actionType;
  }

  constructor(data: Record<string, any>) {
    Logger.log(
      "Initializing EmailJobAction. Params: " + JSON.stringify(data),
      "EmailJobAction",
    );

    this.mailerDetails = {
      mailer: data.mailer,
      to: data.to,
      from: data.from,
      subject: data.subject,
      bodyTemplate: data.bodyTemplate,
    };
  }

  async validate(dto: T) {
    Logger.log(
      "Validating EmailJobAction: " + JSON.stringify(dto),
      "EmailJobAction",
    );

    const mailerDetailsMissing = [undefined, ""].some(el => Object.values(this.mailerDetails).includes(el));
    if (mailerDetailsMissing) {
      throw new NotFoundException("Email action is not configured correctly.");
    }
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing EmailJobAction: " + JSON.stringify(job),
      "EmailJobAction",
    );

    // const mailService: Transporter = createTransport(this.mailerDetails.mailer);
    const toTemplate: TemplateDelegate<JobClass> = compile(this.mailerDetails.to);
    const subjectTemplate: TemplateDelegate<JobClass> = compile(this.mailerDetails.subject);
    const bodyTemplate: TemplateDelegate<JobClass> = compile(this.mailerDetails.bodyTemplate);

    // Fill templates
    const mail: any = {
      to: toTemplate(job),
      from: this.mailerDetails.from,
      subject: subjectTemplate(job),
    };
    if (bodyTemplate) {
      mail.text = bodyTemplate(job);
    }

    Logger.log(mail);

    // await mailService.sendMail(mail);
  }
}
