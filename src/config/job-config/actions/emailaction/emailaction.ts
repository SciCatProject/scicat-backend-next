/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 *
 */
import { readFileSync } from "fs";
import { compileJob, TemplateJob } from "../../handlebar-utils";
import { Logger } from "@nestjs/common";
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { ISendMailOptions } from "@nestjs-modules/mailer";
import { actionType, EmailJobActionOptions } from "./emailaction.interface";
import { MailService } from "src/common/mail.service";

/**
 * Send an email following a job
 */
export class EmailJobAction implements JobAction<JobDto> {
  private toTemplate: TemplateJob;
  private from?: string = undefined;
  private subjectTemplate: TemplateJob;
  private bodyTemplate: TemplateJob;

  getActionType(): string {
    return actionType;
  }

  constructor(
    private mailService: MailService,
    options: EmailJobActionOptions,
  ) {
    Logger.log(
      "Initializing EmailJobAction. Params: " + JSON.stringify(options),
      "EmailJobAction",
    );

    Logger.log("EmailJobAction parameters are valid.", "EmailJobAction");

    if (options["from"]) {
      this.from = options.from as string;
    }
    this.toTemplate = compileJob(options.to);
    this.subjectTemplate = compileJob(options.subject);

    const templateFile = readFileSync(
      options["bodyTemplateFile"] as string,
      "utf8",
    );
    this.bodyTemplate = compileJob(templateFile);
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing EmailJobAction: " + JSON.stringify(job),
      "EmailJobAction",
    );

    // Fill templates
    const mail: ISendMailOptions = {
      to: this.toTemplate(job),
      from: this.from,
      subject: this.subjectTemplate(job),
      html: this.bodyTemplate(job),
    };

    // Send the email
    await this.mailService.sendMail(mail);
  }
}
