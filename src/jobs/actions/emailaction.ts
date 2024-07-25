/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 *
 */
import { readFileSync } from "fs";
import { compile, TemplateDelegate } from "handlebars";
import { Logger, NotFoundException } from "@nestjs/common";
import { JobAction } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";
import configuration from "src/config/configuration";
import { createTransport, Transporter,  } from "nodemailer";


// Handlebar options for JobClass templates
const jobTemplateOptions = {
  allowedProtoProperties: {
    id: true,
    type: true,
    statusCode: true,
    statusMessage: true,
    createdBy: true,
    jobParams: true,
  },
  allowProtoPropertiesByDefault: false, // limit accessible fields for security
};


/**
 * Send an email following a job
 */
export class EmailJobAction<T> implements JobAction<T> {
  public static readonly actionType = "email";
  private messageDetails;

  getActionType(): string {
    return EmailJobAction.actionType;
  }

  constructor(data: Record<string, any>) {
    Logger.log(
      "Initializing EmailJobAction. Params: " + JSON.stringify(data),
      "EmailJobAction",
    );

    this.messageDetails = {
      to: data.to,
      from: data.from,
      password: data.password,
      subject: data.subject,
      bodyTemplate: data.bodyTemplate,
    };
  }

  async validate(dto: T) {
    Logger.log(
      "Validating EmailJobAction: " + JSON.stringify(dto),
      "EmailJobAction",
    );

    const messageDetailsMissing = [undefined, ""].some(el => Object.values(this.messageDetails).includes(el));
    if (messageDetailsMissing) {
      throw new NotFoundException("Email action is not configured correctly.");
    }
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing EmailJobAction: " + JSON.stringify(job),
      "EmailJobAction",
    );

    const mailerConfig = configuration().smtp;

    const mailService: Transporter = createTransport({
      host: mailerConfig.host,
      port: mailerConfig.port,
      secure: mailerConfig.secure,
      auth: {
        user: this.messageDetails.from,
        pass: this.messageDetails.password
      }
    } as any);
    const toTemplate: TemplateDelegate<JobClass> = compile(this.messageDetails.to);
    const subjectTemplate: TemplateDelegate<JobClass> = compile(this.messageDetails.subject);

    const templateFile = readFileSync(this.messageDetails.bodyTemplate, "utf8");
    const bodyTemplate: TemplateDelegate<JobClass> = compile(templateFile);

    // Fill templates
    const mail: any = {
      to: toTemplate(job, jobTemplateOptions),
      from: this.messageDetails.from,
      subject: subjectTemplate(job, jobTemplateOptions),
    };
    if (bodyTemplate) {
      mail.text = bodyTemplate(job, jobTemplateOptions);
    }

    // Send the email
    await mailService.sendMail(mail);
  }
}
