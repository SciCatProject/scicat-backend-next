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
  private mailService: Transporter;
  private toTemplate: TemplateDelegate<JobClass>;
  private from: string;
  private subjectTemplate: TemplateDelegate<JobClass>;
  private bodyTemplate?: TemplateDelegate<JobClass>;

  public static readonly actionType = "email";

  getActionType(): string {
    return EmailJobAction.actionType;
  }

  constructor(data: Record<string, any>) {
    Logger.log(
      "Initializing EmailJobAction. Params: " + JSON.stringify(data),
      "EmailJobAction",
    );

    if (!data["mailer"]) {
      throw new NotFoundException("Param 'mailer' is undefined");
    }
    if (!data["to"]) {
      throw new NotFoundException("Param 'to' is undefined");
    }
    if (!data["from"]) {
      throw new NotFoundException("Param 'from' is undefined");
    }
    if (!data["subject"]) {
      throw new NotFoundException("Param 'subject' is undefined");
    }
    if (!data["body"]) {
      throw new NotFoundException("Param 'body' is undefined");
    }
    Logger.log("EmailJobAction parameters are valid.", "EmailJobAction");

    this.mailService = createTransport(data["mailer"]);
    this.toTemplate = compile(data["to"]);
    this.from = data["from"];
    this.subjectTemplate = compile(data["subject"]);
    this.bodyTemplate = compile(data["body"]);
  }

  async validate(dto: T) {
    Logger.log(
      "Validating EmailJobAction: " + JSON.stringify(dto),
      "EmailJobAction",
    );
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing EmailJobAction: " + JSON.stringify(job),
      "EmailJobAction",
    );

    // Fill templates
    const mail: any = {
      to: this.toTemplate(job),
      from: this.from,
      subject: this.subjectTemplate(job),
    };
    if (this.bodyTemplate) {
      mail.text = this.bodyTemplate(job);
    }
    await this.mailService.sendMail(mail);
  }
}
