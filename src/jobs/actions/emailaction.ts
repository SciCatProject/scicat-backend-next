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
import { CreateJobDto } from "../dto/create-job.dto";


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
    Logger.log("Initializing EmailJobAction. Params: " + JSON.stringify(data), "EmailJobAction");

    this.mailService = createTransport(data["mailer"]);
    this.toTemplate = compile(data["to"]);
    this.from = data["from"];
    this.subjectTemplate = compile(data["subject"]);
    this.bodyTemplate = compile(data["body"]);
  }

  async validate(dto: T) {
    Logger.log("Validating EmailJobAction: " + JSON.stringify(dto), "EmailJobAction");

    if (!this.mailService) {
      throw new NotFoundException("Mailer is undefined");
    }
    if (!this.toTemplate) {
      throw new NotFoundException("To is undefined");
    }
    if (!this.from) {
      throw new NotFoundException("From is undefined");
    }
    if (!this.subjectTemplate) {
      throw new NotFoundException("Subject is undefined");
    }
    if (!this.bodyTemplate) {
      throw new NotFoundException("Body is undefined");
    }

    // TODO ??
    if (!(dto as CreateJobDto).jobParams.pid) {
      throw new NotFoundException("Job pid is undefined");
    }
    if (!(dto as CreateJobDto).jobParams.owner) {
      throw new NotFoundException("Job owner is undefined");
    }
    if (!(dto as CreateJobDto).jobParams.status) {
      throw new NotFoundException("Job status is undefined");
    }
  }

  async performJob(job: JobClass) {
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

    return job;
  }
}
