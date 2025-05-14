/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 *
 */
import { readFileSync } from "fs";
import { compileJobTemplate, TemplateJob } from "../../handlebar-utils";
import { Logger } from "@nestjs/common";
import {
  JobAction,
  JobDto,
  JobPerformContext,
} from "../../jobconfig.interface";
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
    Logger.log("EmailJobAction parameters are valid.", "EmailJobAction");

    if (options["from"]) {
      this.from = options.from as string;
    }
    this.toTemplate = compileJobTemplate(options.to);
    this.subjectTemplate = compileJobTemplate(options.subject);

    const templateFile = readFileSync(
      options["bodyTemplateFile"] as string,
      "utf8",
    );
    this.bodyTemplate = compileJobTemplate(templateFile);
  }

  async performJob(context: JobPerformContext<JobDto>) {
    Logger.log(
      `(Job ${context.job.id}) Performing EmailJobAction`,
      "EmailJobAction",
    );

    // Fill templates
    const mail: ISendMailOptions = {
      to: this.toTemplate(context),
      from: this.from,
      subject: this.subjectTemplate(context),
      html: this.bodyTemplate(context),
    };

    // Send the email
    await this.mailService.sendMail(mail);
  }
}
